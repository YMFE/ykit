'use strict';

const webpack = require('webpack');
const colors = require('colors');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const UtilFs = require('../utils/fs.js');
const ConfigProcessCircle = require('../modules/ConfigProcessCircle.js');

exports.usage = '资源编译、打包';
exports.abbr = 'p';

exports.setOptions = (optimist) => {
    optimist.alias('m', 'min');
    optimist.describe('m', '压缩/混淆项目文件');
    optimist.alias('s', 'sourcemap');
    optimist.describe('s', '使用sourcemap');
    optimist.alias('c', 'clean');
    optimist.describe('c', '打包前清空输出目录');
    optimist.alias('q', 'quiet');
    optimist.describe('q', '静默模式');
    optimist.alias('p', 'process');
    optimist.describe('p', '进程池大小');
};

exports.run = function (options) {
    log(`ykit@${require('../../package.json').version}`);

    const min = options.m || options.min || false,
        clean = options.c || options.clean || true,
        quiet = options.q || options.quiet || false,
        sourcemap = options.s || options.sourcemap,
        processNum = options.p|| options.process || 4,
        packStartTime = Date.now(),
        opt = {
            min: min,
            sourcemap: sourcemap,
            clean: clean === 'false' ? false : true,
            quiet: quiet
        };

    let compilerStats, dist;
    let config = this.project.config.getConfig();

    // eslint-disable-next-line
    start.bind(this.project)().catch(console.log.bind(console));

    async function start() {
        if (process.env['SUDO_UID']) {
            process.setuid(parseInt(process.env['SUDO_UID']));
        }

        if(Object.keys(config.entry).length === 0) {
            logError('No assets entry found.');
            logDoc('http://ued.qunar.com/ykit/docs-%E9%85%8D%E7%BD%AE.html');
            process.exit(1);
        }

        UtilFs.deleteFolderRecursive(this.cachePath);

        await handleBeforePack.bind(this)();
        await prepareConfig.bind(this)();
        await handlebeforeCompiling.bind(this)();
        await compilingProcess.bind(this)();
        await handleAfterPack.bind(this)();
        await printStats.bind(this)();
    }

    async function handlebeforeCompiling() {
        config = await ConfigProcessCircle.runTasksBeforeCompiling(this.hooks, config);
    }

    function handleBeforePack() {
        return new Promise ((resolve, reject) => {
            async.series(
                this.beforePackCallbacks.map((beforePackItem) => {
                    return function(callback) {
                        // 支持旧的 beforePackCallbacks 形式
                        beforePackItem(callback, opt);
                    };
                }).concat(this.hooks.beforePack.map((beforeTask) => {
                    return (callback) => {
                        let isAsync = false;
                        beforeTask.bind({
                            async: () => {
                                isAsync = true;
                                return callback;
                            }
                        })(opt);

                        if(!isAsync) {
                            callback(null);
                        }
                    };
                })),
                (err) => {
                    if(err) {
                        logError(err);
                        process.exit(1);
                    }
                    resolve();
                }
            );
        });
    }

    function prepareConfig() {
        config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());

        if (!opt.quiet) {
            config.plugins.push(require('../plugins/progressBarPlugin.js'));
        }

        if (opt.min) {
            config.output = config.output.prd;
            config.plugins.push(
                new UglifyJsPlugin({
                    sourceMap: false,
                    parallel: true,
                    uglifyOptions: {
                        ie8: true
                    }
                })
            );
        } else {
            config.devtool = 'source-map';
            config.output = config.output.dev;
        }

        if (opt.clean) {
            try {
                UtilFs.deleteFolderRecursive(config.output.path);
            } catch (e) {
                error(e);
            }
        }

        this.fixCss();

        return config;
    }

    function compilingProcess() {
        return new Promise ((resolve, reject) => {
            webpack(config, (err, stats) => {
                compilerStats = stats;
                dist = config.output.path;
                globby
                    .sync('**/*.cache', { cwd: dist })
                    .map(p => {
                        return sysPath.join(config.output.path, p);
                    })
                    .forEach(fp => {
                        fs.unlinkSync(fp);
                    });

                if(err) {
                    spinner.text = '';
                    spinner.stop();
                    logError(err);
                    process.exit(1);
                }

                const statsInfo = stats.toJson({ errorDetails: false });
                if (statsInfo.warnings.length > 0) {
                    spinner.text = '';
                    spinner.stop();
                    logLinefeed();
                    statsInfo.warnings.map(warning => {
                        logWarn(warning + '\n');
                    });
                }

                if (statsInfo.errors.length > 0) {
                    spinner.text = '';
                    spinner.stop();
                    statsInfo.errors.map(err => {
                        logError(err + '\n');
                    });
                    process.exit(1);
                }

                resolve();
            });
        });
    }

    function handleAfterPack () {
        return new Promise((resolve, reject) => {
            spinner.stop();
            async.series(
                this.packCallbacks.concat(this.hooks.afterPack).map((packCallback) => {
                    return function(callback) {
                        let isAsync = false;

                        // 支持异步调用
                        packCallback.bind({
                            async: function(){
                                isAsync = true;
                                return callback;
                            }
                        })(opt, compilerStats);

                        if(!isAsync) {
                            callback(null);
                        }
                    };
                }),
                (err) => {
                    if(err) {
                        logError(err);
                        process.exit(1);
                    }
                    resolve();
                }
            );
        });
    }

    function printStats() {
        return new Promise((resolve, reject) => {
            process.stdout.write(
                '\n---------------------  YKIT EMITTED ASSETS  ---------------------\n\n'
            );

            const statsInfo = compilerStats.toJson({ errorDetails: false });
            const assetsInfo = this.config._config.assetsInfo || statsInfo.assets;
            assetsInfo.map(asset => {
                if (sysPath.extname(asset.name) !== '.cache') {
                    let fileSize = UtilFs.getFileSize(
                        sysPath.resolve(dist, asset.name)
                    );
                    if (!fileSize) {
                        fileSize = asset.size > 1024
                            ? (asset.size / 1024).toFixed(2) + ' KB'
                            : asset.size + ' Bytes';
                    }

                    if (!/\.cache$/.test(asset.name)) {
                        log('- '.gray + colors.bold(colors.green(asset.name)) + ' - ' + fileSize);
                    }
                }
            });

            const packDuration = Date.now() - packStartTime > 1000
                ? Math.floor((Date.now() - packStartTime) / 1000) + 's'
                : Date.now() - packStartTime + 'ms';

            logInfo('Bundling Finishes in ' + packDuration + '.\n');

            resolve();
        });
    }
};
