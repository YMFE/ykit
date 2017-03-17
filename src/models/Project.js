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
        this.configFile = globby.sync(['ykit.*.js', 'ykit.js'], { cwd: cwd })[0] || '';

        this.plugins = [];
        this.config = new Config(cwd, this.configFile);
        this.commands = Manager.getCommands();
        this.middlewares = [];
        this.beforePackCallbacks = [];
        this.packCallbacks = [];
        this.hooks = {
            beforePack: [],
            afterPack: []
        };
        this.eslintConfig = require('../config/eslint.json');
        this.extendConfig = this.configFile &&
            this.configFile.match(/ykit\.([\w\.]+)\.js/) &&
            this.configFile.match(/ykit\.([\w\.]+)\.js/)[1] &&
            this.configFile.match(/ykit\.([\w\.]+)\.js/)[1].replace(/\./g, '-');
        this.ignores = [
            'node_modules/**/*',
            'bower_components/**/*',
            'dev/**/*',
            'prd/**/*',
            YKIT_CACHE_DIR + '/**/*'
        ];
        this.cachePath = this._isCacheDirExists(cwd) || '';

        this.readConfig();
    }

    check() {
        return !!this.configFile;
    }

    setCommands(nextCommands) {
        if (Array.isArray(nextCommands)) {
            // 检查是否有重复的命令
            const existCommands = this.commands.map((cmd) => {
                return cmd.name;
            });
            nextCommands.forEach((cmd) => {
                if(existCommands.indexOf(cmd.name) > -1) {
                    warn(`命令 ${cmd.name} 已经存在，可能会造成冲突。\n`);
                }
            });

            this.commands = this.commands.concat(nextCommands);
        }
    }

    setEslintConfig(projectEslintConfig) {
        extend(true, this.eslintConfig, projectEslintConfig);
    }

    setHooks(nextHooks) {
        if(nextHooks) {
            Object.keys(this.hooks).map((hookName) => {
                if(nextHooks[hookName]) {
                    if(Array.isArray(nextHooks[hookName])) {
                        this.hooks[hookName] = this.hooks[hookName].concat(nextHooks[hookName]);
                    } else if(typeof nextHooks[hookName] === 'function') {
                        this.hooks[hookName] = this.hooks[hookName].concat([nextHooks[hookName]]);
                    }
                }
            });
        }
    }

    readConfig(options) {
        if (this.check()) {
            let globalConfigs = Manager.readRC().configs || [],
                userConfig = {
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
                    // 兼容 ykit-config-yo 的 beforePackCallbacks 和 packCallbacks
                    applyBeforePack: this.applyBeforePack.bind(this),
                    beforePackCallbacks: this.beforePackCallbacks,
                    packCallbacks: this.packCallbacks,
                    hooks: this.hooks,
                    eslintConfig: this.eslintConfig,
                    applyMiddleware: this.config.applyMiddleware.bind(this.config),
                    env: this._getCurrentEnv(), // 默认为本地环境,
                    webpack: webpack
                };

            // 从基础配置往下传给 plugins 和项目配置的 options
            this.options = options = options || {};
            options.ExtractTextPlugin = ExtractTextPlugin;

            // 获取项目配置中的插件
            const configMethod = this._requireUncached(sysPath.join(this.cwd, this.configFile));
            const ykitConfigStartWith = 'ykit-config-';
            if(Array.isArray(configMethod.plugins)) {
                this.plugins = configMethod.plugins;
            } else if(typeof configMethod.plugins === 'string'){
                this.plugins = [configMethod.plugins];
            }

            // 通过配置文件名获取插件
            if (this.extendConfig && this.extendConfig !== 'config') {
                const pluginName = ykitConfigStartWith + this.extendConfig;
                if(this.plugins.indexOf(this.extendConfig) === -1) {
                    this.plugins.push(pluginName);
                }
            }

            // 通过插件扩展配置
            this.plugins.map((pluginItem) => {
                let pluginName = '';

                if(typeof pluginItem === 'string') {
                    pluginName = pluginItem;
                } else if(typeof pluginItem === 'object') {
                    pluginName = pluginItem.name ? pluginItem.name : '';
                    typeof pluginItem.options === 'object' && extend(options, pluginItem.options);
                } else {
                    error(pluginItem.name + ' 插件配置有误，请检查 ykit.js');
                    process.exit(1);
                }

                if(pluginName.indexOf(ykitConfigStartWith) === -1) {
                    pluginName = ykitConfigStartWith + pluginName;
                }

                const localSearchPath = sysPath.join(this.cwd, 'node_modules/', pluginName);
                const localSearchPathQnpm = sysPath.join(
                    this.cwd,
                    'node_modules/',
                    '@qnpm/' + pluginName
                );
                let pluginPath = '';

                if (requireg.resolve(localSearchPath)) {
                    pluginPath = localSearchPath;
                } else if (requireg.resolve(localSearchPathQnpm)) {
                    pluginPath = localSearchPathQnpm;
                    pluginName = '@qnpm/' + pluginName;
                }

                if (fs.existsSync(pluginPath)) {
                    let module = require(pluginPath);

                    if (module && module.config) {
                        module.config.call(userConfig, options, this.cwd);
                    }

                    // 扩展 eslint 配置
                    extend(true, userConfig.eslintConfig, Manager.loadEslintConfig(pluginPath));
                    this.ignores.push(Manager.loadIgnoreFile(pluginPath));
                } else {
                    // 寻找全局插件
                    let item = globalConfigs.filter(item => item.name == pluginName)[0];
                    if (item) {
                        let module = require(item.path);

                        extend(true, userConfig.eslintConfig, Manager.loadEslintConfig(item.path));
                        this.ignores.push(Manager.loadIgnoreFile(item.path));

                        if (module && module.config) {
                            module.config.call(userConfig, options, this.cwd);
                        }
                    } else {
                        error('没有找到 ' + pluginName + ' 配置插件，你可能需要安装相应 NPM 模块。\n'
                            +'   插件文档见: ' + 'http://ued.qunar.com/ykit/plugins.html'.underline);
                        process.exit(1);
                    }
                }
            });

            extend(true, userConfig.eslintConfig, Manager.loadEslintConfig(this.cwd));
            this.ignores.push(Manager.loadIgnoreFile(this.cwd));

            if (configMethod) {
                // 如果传入的是一个简单数组
                if (Array.isArray(configMethod)) {
                    this.config.setExports(configMethod);
                }

                // 如果传入的是一个处理配置方法或对象
                if (typeof configMethod.config === 'function') {
                    handleConfigObj.bind(this)(configMethod.config.call(userConfig, options, this.cwd));
                } else if(typeof configMethod.config === 'object') {
                    handleConfigObj.bind(this)(configMethod.config);
                } else {
                    error(
                        this.configFile +
                            ' 缺少 config 配置项，请参考文档 ' +
                            'http://ued.qunar.com/ykit/docs-配置.html'.underline
                    );
                    process.exit(1);
                }

                function handleConfigObj(userConfigObj) {
                    if(!userConfigObj) {
                        return;
                    }

                    let exports = null;
                    if (Array.isArray(userConfigObj.export)) {
                        exports = userConfigObj.export;
                    } else if (Array.isArray(userConfigObj.exports)) {
                        exports = userConfigObj.exports;
                    }

                    if (exports) {
                        exports = exports.filter(item => {
                            if (typeof item === 'object' && !Array.isArray(item)) {
                                this.config.setGroupExports(item.name, item.export);
                                return false;
                            } else {
                                return true;
                            }
                        });
                    }

                    extend(true, this.config, userConfigObj);
                    this.config.setExports(exports);
                    this.config.setCompiler(userConfigObj.modifyWebpackConfig, userConfig);
                    this.config.setSync(userConfigObj.sync);
                    this.setCommands(configMethod.commands || userConfigObj.command); // 后者兼容以前形式
                    this.setHooks(configMethod.hooks);
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
                entry = Array.isArray(entryItem) ? entryItem[entryItem.length - 1] : entryItem,
                extName = sysPath.extname(entry);

            // 放在cache目录下
            const cachePath = this._isCacheDirExists(this.cwd);
            if (!cachePath) {
                const newCachePath = sysPath.join(this.cwd, YKIT_CACHE_DIR);

                this.cachePath = newCachePath;
                mkdirp.sync(newCachePath);
            }

            if (cssExtNames.indexOf(extName) > -1) {
                let requireFilePath = entries[key] = './' +
                    sysPath.join(contextPathRelativeToCwd, YKIT_CACHE_DIR, entry + '.js'),
                    cacheFilePath = sysPath.join(config.context, requireFilePath);

                mkdirp.sync(sysPath.dirname(cacheFilePath));

                // 将原有entry的css路径写到js中
                if (Array.isArray(entryItem)) {
                    // clear
                    fs.writeFileSync(cacheFilePath, '', 'utf-8');

                    entryItem.forEach(cssPath => {
                        const originCssPath = sysPath.join(config.context, cssPath);
                        const requiredPath = UtilPath.normalize(
                            sysPath.relative(sysPath.dirname(cacheFilePath), originCssPath)
                        );
                        fs.appendFileSync(
                            cacheFilePath,
                            'require("' + requiredPath + '");',
                            'utf-8'
                        );
                    });
                } else {
                    const originCssPath = sysPath.join(config.context, entry);
                    const requiredPath = UtilPath.normalize(
                        sysPath.relative(sysPath.dirname(cacheFilePath), originCssPath)
                    );
                    fs.writeFileSync(cacheFilePath, 'require("' + requiredPath + '");', 'utf-8');
                }

                fps.push(cacheFilePath);
            }
        }

        // 如果没有 ExtractTextPlugin 则添加进 Plugins
        const isExtractTextPluginExists = config.plugins.some((plugin) => {
            return plugin instanceof ExtractTextPlugin;
        });
        if(!isExtractTextPluginExists) {
            config.plugins.push(new ExtractTextPlugin(config.output.filename.replace('[ext]', '.css')));
        }
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

    applyBeforePack(nextBeforePackCB) {
        if (typeof nextBeforePackCB === 'function') {
            this.beforePackCallbacks.push(nextBeforePackCB);
        } else if (Array.isArray(nextBeforePackCB)) {
            this.beforePackCallbacks.concat(nextBeforePackCB);
        }
    }

    pack(opt, callback) {
        let self = this, packStartTime = Date.now(), config = this.config.getConfig();

        UtilFs.deleteFolderRecursive(this.cachePath);

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

                globby
                    .sync('**/*.cache', { cwd: cwd })
                    .map(p => {
                        return sysPath.join(config.output.path, p);
                    })
                    .forEach(fp => {
                        fs.unlinkSync(fp);
                    });

                // 压缩
                if (opt.min) {
                    const computecluster = require('compute-cluster');
                    const cc = new computecluster({
                        module: sysPath.resolve(__dirname, '../modules/minWorker.js'),
                        max_backlog: -1,
                        max_processes: 5
                    });

                    spinner.start();

                    const assetsInfo = stats.toJson({
                        errorDetails: false
                    }).assets;
                    let processToRun = assetsInfo.length;

                    const originAssets = stats.compilation.assets;
                    const nextAssets = {};
                    assetsInfo.forEach(asset => {
                        cc.enqueue(
                            {
                                opt: opt,
                                cwd: cwd,
                                buildOpts: this.config.build || {},
                                assetName: asset.name
                            },
                            (err, response) => {
                                if (response.error) {
                                    // err log
                                    const resErr = response.error;
                                    spinner.text = '';
                                    spinner.stop();
                                    info('\n');
                                    spinner.text = `error occured while minifying ${resErr.assetName}`;
                                    spinner.fail();
                                    info(
                                        `line: ${resErr.line}, col: ${resErr.col} ${resErr.message} \n`.red
                                    );

                                    // continue
                                    spinner.start();
                                }

                                // 将替换版本号的资源名取代原有名字
                                const replacedAssets = response.replacedAssets;
                                if (replacedAssets && replacedAssets.length > 0) {
                                    const originAssetName = replacedAssets[0];
                                    const nextAssetName = replacedAssets[1];
                                    if (originAssets[originAssetName]) {
                                        nextAssets[nextAssetName] = originAssets[originAssetName];
                                    }
                                }

                                processToRun -= 1;
                                spinner.text = `[Minify] ${assetsInfo.length -
                                    processToRun}/${assetsInfo.length} assets`;

                                if(processToRun === 0) {
                                    cc.exit();
                                    spinner.stop();

                                    logTime('minify complete!');

                                    // 更新 stats
                                    stats.compilation.assets = Object.keys(nextAssets).length > 0
                                        ? nextAssets
                                        : originAssets;

                                    handleAfterPack();
                                }
                            }
                        );
                    });
                } else {
                    handleAfterPack();
                }

                function handleAfterPack() {
                    spinner.stop();
                    async.series(
                        self.packCallbacks.concat(self.hooks.afterPack).map((packCallback) => {
                            return function(callback) {
                                let isAsync = false;

                                // 支持异步调用
                                packCallback.bind({
                                    async: function(){
                                        isAsync = true;
                                        return callback;
                                    }
                                })(opt, stats);

                                if(!isAsync) {
                                    callback(null);
                                }
                            };
                        }),
                        err => {
                            let statsInfo = stats.toJson({ errorDetails: false });

                            if (statsInfo.errors.length > 0) {
                                statsInfo.errors.map(err => {
                                    error('[Bundle Error]: ' + err.red + '\n');
                                });
                                process.exit(1);
                            }
                            if (statsInfo.warnings.length > 0) {
                                statsInfo.warnings.map(warning => {
                                    warn('[Bundle Warninig]: ' +warning.yellow + '\n');
                                });
                            }

                            process.stdout.write(
                                '\n---------------------  YKIT EMITTED ASSETS  ---------------------\n\n'
                            );

                            const assetsInfo = self.config._config.assetsInfo || statsInfo.assets;
                            assetsInfo.map(asset => {
                                if (sysPath.extname(asset.name) !== '.cache') {
                                    let fileSize = UtilFs.getFileSize(
                                        path.resolve(cwd, asset.name)
                                    );
                                    if (!fileSize) {
                                        fileSize = asset.size > 1024
                                            ? (asset.size / 1024).toFixed(2) + ' KB'
                                            : asset.size + ' Bytes';
                                    }

                                    if (!/\.cache$/.test(asset.name)) {
                                        log('- '.gray + asset.name + ' - ' + fileSize);
                                    }
                                }
                            });

                            const packDuration = Date.now() - packStartTime > 1000
                                ? Math.floor((Date.now() - packStartTime) / 1000) + 's'
                                : Date.now() - packStartTime + 'ms';
                            log('Packing Finished in ' + packDuration + '.\n');

                            callback(err, stats);
                        }
                    );
                }
            });
        };

        async.series(
            this.beforePackCallbacks.map((beforePackItem) => {
                return function(callback) {
                    // 支持旧的 beforePackCallbacks 形式
                    beforePackItem(callback, opt);
                };
            }).concat(this.hooks.beforePack.map((beforePackItem) => {
                return function(callback) {
                    // 支持异步调用
                    let isAsync = false;
                    beforePackItem.bind({
                        async: function(){
                            isAsync = true;
                            return callback;
                        }
                    })(opt);

                    if(!isAsync) {
                        callback(null);
                    }
                };
            })),
            err => {
                compilerProcess();
            }
        );

        return this;
    }

    getServerCompiler(handler) {
        let config = this.config.getConfig();
        config.output = extend(
            true,
            {
                path: config.output.prd.path,
                filename: '[name][ext]'
            },
            config.output.local || {}
        );

        this.fixCss();

        if (handler && typeof handler === 'function') {
            config = handler(config);
        }

        return webpack(config);
    }

    _getLintFiles(dir, fileType) {
        let context = this.config._config.context,
            extNames = this.config._config.entryExtNames[fileType],
            lintPath = extNames.map(ext => {
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

        return globby
            .sync(lintPath, {
                cwd: context,
                root: context,
                ignore: this.ignores
            })
            .map(lintPathItem => {
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
            fs.statSync(sysPath.join(cwd, YKIT_CACHE_DIR));
            return sysPath.join(cwd, YKIT_CACHE_DIR);
        } catch (e) {
            // do nothing
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
