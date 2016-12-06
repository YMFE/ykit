'use strict';

const webpack = require('webpack');
const requireg = require('requireg');

const path = require('path');
const fs = require('fs');

const Config = require('./Config.js');
const Manager = require('../modules/manager.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const UtilFs = require('../utils/fs.js');
const UtilPath = require('../utils/path.js');

const ENVS = {
    LOCAL: 'local',
    DEV: 'dev',
    PRD: 'prd'
};

class Project {
    constructor(cwd) {
        this.cwd = cwd;
        this.config = new Config(cwd);
        this.commands = Manager.getCommands();
        this.middlewares = [];
        this.packCallbacks = [];
        this.eslintConfig = require('../config/eslint.json');
        this.configFile = globby.sync([
            'ykit.*.js', 'ykit.js'
        ], {cwd: this.cwd})[0] || '';
        this.extendConfig = this.configFile && this.configFile.match(/ykit\.([\w\.]+)\.js/) && this.configFile.match(/ykit\.([\w\.]+)\.js/)[1] && this.configFile.match(/ykit\.([\w\.]+)\.js/)[1].replace(/\./g, '-');
        this.ignores = ['node_modules/**/*', 'bower_components/**/*', 'dev/**/*', 'prd/**/*', '.ykit_cache/**/*'];
        this.cachePath = this._isCacheDirExists(cwd) || '';

        this.readConfig();
    }

    check() {
        return !!this.configFile;
    }

    setCommands(nextCommands) {
        if (Array.isArray(nextCommands)) {
            this.commands = this.commands.concat(nextCommands);
        }
    }

    setEslintConfig(projectEslintConfig) {
        extend(true, this.eslintConfig, projectEslintConfig);
    }

    readConfig(options) {
        if (this.check()) {
            let userConfig = {
                    cwd: this.cwd,
                    _manager: Manager,
                    setConfig: this.config.setCompiler.bind(this.config), // 兼容旧api
                    setCompile: this.config.setCompiler.bind(this.config), // 兼容旧api
                    setCompiler: this.config.setCompiler.bind(this.config),
                    setExports: this.config.setExports.bind(this.config),
                    setGroupExports: this.config.setGroupExports.bind(this.config),
                    setSync: this.config.setSync.bind(this.config),
                    setCommands: this.setCommands.bind(this),
                    setEslintConfig: this.setEslintConfig.bind(this),
                    config: this.config.getConfig(),
                    commands: this.commands,
                    middlewares: this.middlewares,
                    applyBeforePack: this.config.applyBeforePack.bind(this.config),
                    packCallbacks: this.packCallbacks,
                    eslintConfig: this.eslintConfig,
                    applyMiddleware: this.config.applyMiddleware.bind(this.config),
                    env: this._getCurrentEnv(), // 默认为本地环境,
                    webpack: webpack
                },
                globalConfigs = Manager.readRC().configs || [];

            this.options = options = options || {};
            options.ExtractTextPlugin = ExtractTextPlugin;

            if (this.extendConfig != 'config') {
                let moduleName = 'ykit-config-' + this.extendConfig,
                    modulePath = '';

                const localSearchPath = sysPath.join(this.cwd, 'node_modules/', moduleName);
                const localSearchPathQnpm = sysPath.join(this.cwd, 'node_modules/', '@qnpm/' + moduleName);

                if (requireg.resolve(localSearchPath)) {
                    modulePath = localSearchPath;
                } else if (requireg.resolve(moduleName)) {
                    modulePath = requireg.resolve(moduleName);
                } else if (requireg.resolve(localSearchPathQnpm)) {
                    modulePath = localSearchPathQnpm;
                    moduleName = '@qnpm/' + moduleName;
                } else if (requireg.resolve('@qnpm/' + moduleName)) {
                    modulePath = requireg.resolve('@qnpm/' + moduleName);
                    moduleName = '@qnpm/' + moduleName;
                }

                extend(true, userConfig.eslintConfig, Manager.loadEslintConfig(modulePath));
                this.ignores.push(Manager.loadIgnoreFile(modulePath));

                if (fs.existsSync(modulePath)) {
                    let module = require(modulePath);

                    if (module && module.config) {
                        module.config.call(userConfig, options, this.cwd);
                    }
                } else {
                    let item = globalConfigs.filter((item) => item.name == moduleName)[0];
                    if (item) {
                        let module = require(item.path);

                        extend(true, userConfig.eslintConfig, Manager.loadEslintConfig(item.path));
                        this.ignores.push(Manager.loadIgnoreFile(item.path));

                        if (module && module.config) {
                            module.config.call(userConfig, options, this.cwd);
                        }
                    } else {
                        if (this.extendConfig) {
                            warn('没有找到 ykit-config-' + this.extendConfig + ' 配置模块！');
                        }
                    }
                }
            }

            let configMethod = this._requireUncached(sysPath.join(this.cwd, this.configFile));
            extend(true, userConfig.eslintConfig, Manager.loadEslintConfig(this.cwd));
            this.ignores.push(Manager.loadIgnoreFile(this.cwd));

            if (configMethod) {
                if (Array.isArray(configMethod)) {
                    this.config.setExports(configMethod);
                }
                if (typeof configMethod.config == 'function') {
                    const userConfigObj = configMethod.config.call(userConfig, options, this.cwd);

                    if (userConfigObj) {
                        let exports = null;
                        if (Array.isArray(userConfigObj.export)) {
                            exports = userConfigObj.export;
                        } else if (Array.isArray(userConfigObj.exports)) {
                            exports = userConfigObj.exports;
                        }

                        if (exports) {
                            exports = exports.filter((item) => {
                                if (typeof item === 'object') {
                                    this.config.setGroupExports(item.name, item.export);
                                    return false;
                                } else {
                                    return true;
                                }
                            });
                        }

                        this.config.setExports(exports);
                        this.config.setCompiler(userConfigObj.modifyWebpackConfig);
                        this.config.setSync(userConfigObj.sync);
                        this.setCommands(userConfigObj.command);
                    }
                } else {
                    error(this.configFile + ' 没有 exports 正确的方法！');
                    return this;
                }
            }

            let output = this.config.getConfig().output;
            for (let key in output) {
                var op = output[key];
                if (op.path && !sysPath.isAbsolute(op.path)) {
                    op.path = sysPath.join(this.cwd, op.path);
                }
            }
        }
        return this;
    }

    fixCss() {
        let config = this.config.getConfig(),
            entries = config.entry,
            cssExtNames = config.entryExtNames.css,
            fps = [];

        const contextPathRelativeToCwd = sysPath.relative(config.context, this.cwd) || '.';

        for (let key in entries) {
            const entryItem = entries[key],
                entry = Array.isArray(entryItem)
                    ? entryItem[entryItem.length - 1]
                    : entryItem,
                extName = sysPath.extname(entry);

            // 放在cache目录下
            const cachePath = this._isCacheDirExists(this.cwd);
            if (!cachePath) {
                const newCachePath = sysPath.join(this.cwd, '.ykit_cache');

                this.cachePath = newCachePath;
                mkdirp.sync(newCachePath);
            }

            if (cssExtNames.indexOf(extName) > -1) {
                let requireFilePath = entries[key] = './' + sysPath.join(contextPathRelativeToCwd, '/.ykit_cache', entry + '.js'),
                    cacheFilePath = sysPath.join(config.context, requireFilePath);

                mkdirp.sync(sysPath.dirname(cacheFilePath));

                // 将原有entry的css路径写到js中
                if (Array.isArray(entryItem)) {
                    // clear
                    fs.writeFileSync(cacheFilePath, '', 'utf-8');

                    entryItem.forEach((cssPath) => {
                        const originCssPath = sysPath.join(config.context, cssPath);
                        const requiredPath = UtilPath.normalize(sysPath.relative(sysPath.dirname(cacheFilePath), originCssPath));
                        fs.appendFileSync(cacheFilePath, 'require("' + requiredPath + '");', 'utf-8');
                    });
                } else {
                    const originCssPath = sysPath.join(config.context, entry);
                    const requiredPath = UtilPath.normalize(sysPath.relative(sysPath.dirname(cacheFilePath), originCssPath));
                    fs.writeFileSync(cacheFilePath, 'require("' + requiredPath + '");', 'utf-8');
                }

                fps.push(cacheFilePath);
            }
        }
        config.plugins.push(new ExtractTextPlugin(config.output.filename.replace('[ext]', '.css')));
    }

    lint(dir, callback) {
        warn('Linting JS Files ...');

        let CLIEngine = require('eslint').CLIEngine;

        // 如果有本地eslint优先使用本地eslint
        if (requireg.resolve(sysPath.join(this.cwd, 'node_modules/', 'eslint'))) {
            CLIEngine = requireg(sysPath.join(this.cwd, 'node_modules/', 'eslint')).CLIEngine;
        }

        let files = ['.js', '.yaml', '.yml', '.json', ''].map(ext => {
            return path.join(this.cwd, '.eslintrc' + ext);
        });
        let config = UtilFs.readFileAny(files);

        // 本地无 lint 配置，创建 .eslintrc.json
        if (!config) {
            let configPath = path.join(this.cwd, '.eslintrc.json');
            fs.writeFileSync(configPath, JSON.stringify(this.eslintConfig, null, 4));
        } else {
            this.eslintConfig = config;
        }

        const cli = new CLIEngine(this.eslintConfig),
            report = cli.executeOnFiles(this._getLintFiles(dir, 'js')),
            formatter = cli.getFormatter();

        if (report.errorCount > 0) {
            info(formatter(report.results));
        }

        callback(null, !report.errorCount);
    }

    pack(opt, callback) {
        let self = this,
            packStartTime = Date.now(),
            config = this.config.getConfig();

        UtilFs.deleteFolderRecursive(this.cachePath);

        if (!config.beforePack) {
            config.beforePack = function(done) {
                done();
            };
        }

        const compilerProcess = () => {
            // 打包前设置
            if (opt.sourcemap) {
                config.devtool = opt.sourcemap;
            }
            if (!opt.quiet) {
                config.plugins.push(require('../plugins/progressBarPlugin.js'));
            }
            if (opt.min) {
                config.output = config.output.prd;
                config.devtool = '';
            } else {
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

            webpack(config, (err, stats) => {
                const cwd = config.output.path;

                globby.sync('**/*.cache', {cwd: cwd}).map((p) => {
                    return sysPath.join(config.output.path, p);
                }).forEach((fp) => {
                    fs.unlinkSync(fp);
                });

                // 压缩
                const computecluster = require('compute-cluster');
                const cc = new computecluster({
                    module: sysPath.resolve(__dirname , '../modules/minifyWorker.js'),
                    max_backlog: -1,
                    max_processes: 5
                });

                if(opt.min) {
                    spinner.start();

                    const assetsInfo = stats.toJson({
                        errorDetails: false
                    }).assets;
                    let processToRun = assetsInfo.length;

                    assetsInfo.forEach((asset) => {
                        cc.enqueue({
                            opt: opt,
                            cwd: cwd,
                            assetName: asset.name
                        }, (err) => {
                            if (err) {
                                error('an error occured:', err);
                            }

                            processToRun -= 1;
                            spinner.text = `[Minify] ${assetsInfo.length - processToRun}/${assetsInfo.length} assets`;

                            if (processToRun === 0) {
                                cc.exit();
                                spinner.stop();
                                logTime('minify complete!');

                                async.series(self.packCallbacks.map((packCallback) => {
                                    return function(callback) {
                                        packCallback(opt, stats);
                                        callback(null);
                                    };
                                }), (err) => {
                                    let statsInfo = stats.toJson({errorDetails: false});

                                    process.stdout.write('\n' +
                                        '\x1b[90m' +
                                        '--------------------------  YKIT PACKED ASSETS  -------------------------- ' +
                                        '\x1b[0m \n\n');

                                    if (statsInfo.errors.length > 0) {
                                        statsInfo.errors.map((err) => {
                                            error(err.red + '\n');
                                        });
                                    }
                                    if (statsInfo.warnings.length > 0) {
                                        statsInfo.warnings.map((warning) => {
                                            warn(warning.yellow + '\n');
                                        });
                                    }

                                    const assetsInfo = self.config._config.assetsInfo || statsInfo.assets;
                                    assetsInfo.map((asset) => {
                                        const size = asset.size > 1024
                                            ? (asset.size / 1024).toFixed(2) + ' kB'
                                            : asset.size + ' bytes';
                                        if (!/\.cache$/.test(asset.name)) {
                                            log('- '.gray + asset.name + ' - ' + size);
                                        }
                                    });

                                    const packDuration = Date.now() - packStartTime > 1000
                                                        ? Math.floor((Date.now() - packStartTime) / 1000) + 's'
                                                        : (Date.now() - packStartTime) + 'ms';
                                    log('Finished in ' + packDuration + '.\n');

                                    callback(err, stats);
                                });
                            }
                        });
                    });
                }
            });
        };

        config.beforePack(() => {
            if (opt.lint) {
                async.series([(callback) => this.lint(callback)], (err, results) => {
                    if (!err) {
                        if (results[0] && results[1]) {
                            compilerProcess();
                        }
                    } else {
                        error(err.stack);
                    }
                });
            } else {
                compilerProcess();
            }
        });

        return this;
    }

    getServerCompiler(handler) {
        let config = this.config.getConfig();
        config.output = extend(true, {
            path: config.output.prd.path,
            filename: '[name][ext]'
        }, config.output.local || {});

        this.fixCss();

        if (handler && typeof handler === 'function') {
            config = handler(config);
        }

        return webpack(config);
    }

    _getLintFiles(dir, fileType) {
        let context = this.config._config.context,
            extNames = this.config._config.entryExtNames[fileType],
            lintPath = extNames.map((ext) => {
                return sysPath.join('./**/*' + ext);
            });

        if (dir) {
            dir = sysPath.resolve(this.cwd, dir);
            try {
                fs.statSync(dir).isDirectory()
                    ? context = dir
                    : lintPath = sysPath.relative(context, dir);
            } catch (e) {
                error(e);
                process.exit(1);
            }
        }

        return globby.sync(lintPath, {
            cwd: context,
            root: context,
            ignore: this.ignores
        }).map((lintPathItem) => {
            return sysPath.resolve(context, lintPathItem);
        });
    }

    _requireUncached(module) {
        delete require.cache[require.resolve(module)];
        return require(module);
    }

    _isCacheDirExists(cwd) {
        let isCacheExists;

        try {
            fs.statSync(sysPath.join(cwd, '.ykit_cache'));
            return sysPath.join(cwd, '.ykit_cache');
        } catch (e) {
            // do nothing
        }

        try {
            fs.statSync(sysPath.join(cwd, '.cache'));
            return sysPath.join(cwd, '.cache');
        } catch (e) {
            isCacheExists == false;
        }

        return false;
    }

    _getCurrentEnv() {
        if (process.argv[2] === 'pack') {
            if (process.argv.indexOf('-m') > -1) {
                return ENVS.PRD;
            } else {
                return ENVS.DEV;
            }
        }

        return ENVS.LOCAL;
    }
}

module.exports = Project;
