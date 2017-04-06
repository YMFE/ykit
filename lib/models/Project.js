'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var webpack = require('webpack');
var requireg = require('requireg');
var colors = require('colors');

var path = require('path');
var fs = require('fs');

var Config = require('./Config.js');
var Manager = require('../modules/manager.js');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var UtilFs = require('../utils/fs.js');
var UtilPath = require('../utils/path.js');

var ENVS = {
    LOCAL: 'local',
    DEV: 'dev',
    PRD: 'prd'
};

var Project = function () {
    function Project(cwd) {
        _classCallCheck(this, Project);

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
        this.eslintConfig = require('../../static/eslint/eslint.json');
        this.extendConfig = this.configFile && this.configFile.match(/ykit\.([\w\.]+)\.js/) && this.configFile.match(/ykit\.([\w\.]+)\.js/)[1] && this.configFile.match(/ykit\.([\w\.]+)\.js/)[1].replace(/\./g, '-');
        this.ignores = ['node_modules/**/*', 'bower_components/**/*', 'dev/**/*', 'prd/**/*', YKIT_CACHE_DIR + '/**/*'];
        this.cachePath = this._isCacheDirExists(cwd) || '';

        this.readConfig();
    }

    _createClass(Project, [{
        key: 'setCommands',
        value: function setCommands(nextCommands, pluginName) {
            if (Array.isArray(nextCommands)) {
                var existCommands = this.commands.map(function (cmd) {
                    return cmd.name;
                });
                nextCommands.forEach(function (cmd) {
                    if (pluginName) {
                        cmd.pluginName = pluginName;
                    }

                    // 检查是否有重复的命令
                    if (existCommands.indexOf(cmd.name) > -1) {
                        logWarn('Command ' + cmd.name + ' exists. It may cause collision.');
                    }
                });

                this.commands = this.commands.concat(nextCommands);
            }
        }
    }, {
        key: 'setEslintConfig',
        value: function setEslintConfig(projectEslintConfig) {
            extend(true, this.eslintConfig, projectEslintConfig);
        }
    }, {
        key: 'setHooks',
        value: function setHooks(nextHooks) {
            var _this = this;

            if (nextHooks) {
                Object.keys(this.hooks).map(function (hookName) {
                    if (nextHooks[hookName]) {
                        if (Array.isArray(nextHooks[hookName])) {
                            _this.hooks[hookName] = _this.hooks[hookName].concat(nextHooks[hookName]);
                        } else if (typeof nextHooks[hookName] === 'function') {
                            _this.hooks[hookName] = _this.hooks[hookName].concat([nextHooks[hookName]]);
                        }
                    }
                });
            }
        }
    }, {
        key: 'readConfig',
        value: function readConfig() {
            var _this2 = this;

            if (!this.configFile) {
                // no local config, i.e., server command)
                return;
            }

            var globalConfigs = Manager.readRC().configs || [],
                localConfig = {
                cwd: this.cwd,
                _manager: Manager,
                setConfig: this.config.setCompiler.bind(this.config), // 兼容旧 api
                setCompile: this.config.setCompiler.bind(this.config), // 兼容旧 api
                setCompiler: this.config.setCompiler.bind(this.config),
                setExports: this.config.setExports.bind(this.config),
                setSync: this.config.setSync.bind(this.config),
                setCommands: this.setCommands.bind(this),
                setEslintConfig: this.setEslintConfig.bind(this),
                config: this.config.getConfig(),
                commands: this.commands,
                middlewares: this.middlewares,
                applyBeforePack: this.applyBeforePack.bind(this),
                beforePackCallbacks: this.beforePackCallbacks, // 兼容 ykit-config-yo 的 beforePackCallbacks
                packCallbacks: this.packCallbacks, // 兼容 ykit-config-yo 的 packCallbacks
                hooks: this.hooks,
                eslintConfig: this.eslintConfig,
                applyMiddleware: this.config.applyMiddleware.bind(this.config),
                env: this._getCurrentEnv(), // 默认为本地环境,
                webpack: webpack
            };

            // 获取项目配置
            var ykitConfigFile = this._requireUncached(sysPath.join(this.cwd, this.configFile));

            // 获取插件
            var ykitConfigStartWith = 'ykit-config-';
            if (Array.isArray(ykitConfigFile.plugins)) {
                this.plugins = ykitConfigFile.plugins;
            } else if (typeof ykitConfigFile.plugins === 'string') {
                this.plugins = [ykitConfigFile.plugins];
            }
            if (this.extendConfig && this.extendConfig !== 'config') {
                var pluginName = ykitConfigStartWith + this.extendConfig;
                if (this.plugins.indexOf(this.extendConfig) === -1) {
                    this.plugins.push(pluginName);
                }
            }

            // 通过插件扩展配置
            this.plugins.map(function (pluginItem) {
                var pluginName = '';

                // 获取插件信息
                if (typeof pluginItem === 'string') {
                    pluginName = pluginItem;
                } else if ((typeof pluginItem === 'undefined' ? 'undefined' : _typeof(pluginItem)) === 'object') {
                    pluginName = pluginItem.name ? pluginItem.name : '';
                    // 兼容以前从 options 传进去 ExtractTextPlugin
                    if (_typeof(pluginItem.options) === 'object') {
                        pluginItem.options.ExtractTextPlugin = ExtractTextPlugin;
                    }
                } else {
                    logError(pluginItem.name || 'Unknown' + ' plugin config error，please check local ykit.js.');
                    logDoc('http://ued.qunar.com/ykit/plugins.html');
                }

                if (pluginName.indexOf(ykitConfigStartWith) === -1) {
                    pluginName = ykitConfigStartWith + pluginName;
                }

                // 寻找插件模块位置
                var localSearchPath = sysPath.join(_this2.cwd, 'node_modules/', pluginName);
                var localSearchPathQnpm = sysPath.join(_this2.cwd, 'node_modules/', '@qnpm/' + pluginName);
                var pluginPath = '';
                if (requireg.resolve(localSearchPath)) {
                    pluginPath = localSearchPath;
                } else if (requireg.resolve(localSearchPathQnpm)) {
                    pluginPath = localSearchPathQnpm;
                    pluginName = '@qnpm/' + pluginName;
                }

                if (fs.existsSync(pluginPath)) {
                    var _module = require(pluginPath);

                    // 运行插件模块
                    if (_module && _module.config) {
                        handleExportsConfig.bind(_this2)(_module.config, pluginItem.options);
                        _this2.setCommands(_module.commands || ykitConfigFile.config.command, pluginName); // 后者兼容以前形式
                        _this2.setHooks(_module.hooks);
                    }

                    // 扩展 eslint 配置
                    extend(true, localConfig.eslintConfig, Manager.loadEslintConfig(pluginPath));
                    _this2.ignores.push(Manager.loadIgnoreFile(pluginPath));
                } else {
                    logError('Local ' + pluginName + ' plugin not found，you may need to intall it first.');
                    logDoc('http://ued.qunar.com/ykit/plugins.html');
                }
            });

            if (ykitConfigFile && ykitConfigFile.config) {
                extend(true, this.config, ykitConfigFile.config);
                handleExportsConfig.bind(this)(ykitConfigFile.config);
                this.setCommands(ykitConfigFile.commands || ykitConfigFile.config.command); // 后者兼容以前形式
                this.setHooks(ykitConfigFile.hooks);
            } else {
                logError('Local ' + this.configFile + ' config not found.');
                logDoc('http://ued.qunar.com/ykit/docs-配置.html');
            }

            // 处理 eslint
            extend(true, localConfig.eslintConfig, Manager.loadEslintConfig(this.cwd));
            this.ignores.push(Manager.loadIgnoreFile(this.cwd));

            // 处理 output
            var output = this.config.getConfig().output;
            for (var key in output) {
                var op = output[key];
                if (op.path && !sysPath.isAbsolute(op.path)) {
                    op.path = sysPath.join(this.cwd, op.path);
                }
            }

            // 处理 exports.config
            function handleExportsConfig(exportsConfig, options) {

                if (typeof exportsConfig === 'function') {
                    options = options ? options : {};
                    options.ExtractTextPlugin = ExtractTextPlugin; // 兼容以前从 options 传进去 ExtractTextPlugin

                    var configFunResult = exportsConfig.call(localConfig, options, this.cwd);
                    exportsConfig = configFunResult ? configFunResult : exportsConfig;
                }

                if (exportsConfig.export || exportsConfig.exports) {
                    var exports = null;
                    if (Array.isArray(exportsConfig.export)) {
                        exports = exportsConfig.export;
                    } else if (Array.isArray(exportsConfig.exports)) {
                        exports = exportsConfig.exports;
                    }
                    this.config.setExports(exports);
                }

                this.config.setCompiler(exportsConfig.modifyWebpackConfig, localConfig);
                this.config.setSync(exportsConfig.sync);
            }
        }
    }, {
        key: 'fixCss',
        value: function fixCss() {
            var config = this.config.getConfig(),
                entries = config.entry,
                cssExtNames = config.entryExtNames.css,
                fps = [];

            var contextPathRelativeToCwd = sysPath.relative(config.context, this.cwd) || '.';

            for (var key in entries) {
                var entryItem = entries[key],
                    entry = Array.isArray(entryItem) ? entryItem[entryItem.length - 1] : entryItem,
                    extName = sysPath.extname(entry);

                // 放在cache目录下
                var cachePath = this._isCacheDirExists(this.cwd);
                if (!cachePath) {
                    var newCachePath = sysPath.join(this.cwd, YKIT_CACHE_DIR);

                    this.cachePath = newCachePath;
                    mkdirp.sync(newCachePath);
                }

                if (cssExtNames.indexOf(extName) > -1) {
                    (function () {
                        var requireFilePath = entries[key] = './' + sysPath.join(contextPathRelativeToCwd, YKIT_CACHE_DIR, entry + '.js'),
                            cacheFilePath = sysPath.join(config.context, requireFilePath);

                        mkdirp.sync(sysPath.dirname(cacheFilePath));

                        // 将原有entry的css路径写到js中
                        if (Array.isArray(entryItem)) {
                            // clear
                            fs.writeFileSync(cacheFilePath, '', 'utf-8');

                            entryItem.forEach(function (cssPath) {
                                var originCssPath = sysPath.join(config.context, cssPath);
                                var requiredPath = UtilPath.normalize(sysPath.relative(sysPath.dirname(cacheFilePath), originCssPath));
                                fs.appendFileSync(cacheFilePath, 'require("' + requiredPath + '");', 'utf-8');
                            });
                        } else {
                            var originCssPath = sysPath.join(config.context, entry);
                            var requiredPath = UtilPath.normalize(sysPath.relative(sysPath.dirname(cacheFilePath), originCssPath));
                            fs.writeFileSync(cacheFilePath, 'require("' + requiredPath + '");', 'utf-8');
                        }

                        fps.push(cacheFilePath);
                    })();
                }
            }

            // 如果没有 ExtractTextPlugin 则添加进 Plugins
            var isExtractTextPluginExists = config.plugins.some(function (plugin) {
                return plugin instanceof ExtractTextPlugin;
            });
            if (!isExtractTextPluginExists) {
                config.plugins.push(new ExtractTextPlugin(config.output.filename.replace('[ext]', '.css')));
            }
        }
    }, {
        key: 'lint',
        value: function lint(dir, callback) {
            var _this3 = this;

            warn('Linting JS Files ...');

            var CLIEngine = require('eslint').CLIEngine;

            // 如果有本地eslint优先使用本地eslint
            if (requireg.resolve(sysPath.join(this.cwd, 'node_modules/', 'eslint'))) {
                CLIEngine = requireg(sysPath.join(this.cwd, 'node_modules/', 'eslint')).CLIEngine;
            }

            var files = ['.js', '.yaml', '.yml', '.json', ''].map(function (ext) {
                return path.join(_this3.cwd, '.eslintrc' + ext);
            });
            var config = UtilFs.readFileAny(files);

            // 本地无 lint 配置，创建 .eslintrc.json
            if (!config) {
                var configPath = path.join(this.cwd, '.eslintrc.json');
                fs.writeFileSync(configPath, JSON.stringify(this.eslintConfig, null, 4));
            } else {
                this.eslintConfig = config;
            }

            var cli = new CLIEngine(this.eslintConfig),
                report = cli.executeOnFiles(this._getLintFiles(dir, 'js')),
                formatter = cli.getFormatter();

            if (report.errorCount > 0) {
                info(formatter(report.results));
            }

            callback(null, !report.errorCount);
        }
    }, {
        key: 'applyBeforePack',
        value: function applyBeforePack(nextBeforePackCB) {
            if (typeof nextBeforePackCB === 'function') {
                this.beforePackCallbacks.push(nextBeforePackCB);
            } else if (Array.isArray(nextBeforePackCB)) {
                this.beforePackCallbacks.concat(nextBeforePackCB);
            }
        }
    }, {
        key: 'pack',
        value: function pack(opt, callback) {
            var _this4 = this;

            var self = this,
                packStartTime = Date.now(),
                config = this.config.getConfig();

            if (Object.keys(config.entry).length === 0) {
                logWarn('Local config exports aseets not found.');
                logDoc('http://ued.qunar.com/ykit/docs-%E9%85%8D%E7%BD%AE.html');
                process.exit(1);
            }

            UtilFs.deleteFolderRecursive(this.cachePath);

            var compilerProcess = function compilerProcess() {
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

                _this4.fixCss();

                webpack(config, function (err, stats) {
                    var cwd = config.output.path;

                    globby.sync('**/*.cache', { cwd: cwd }).map(function (p) {
                        return sysPath.join(config.output.path, p);
                    }).forEach(function (fp) {
                        fs.unlinkSync(fp);
                    });

                    // 压缩
                    if (opt.min) {
                        var computecluster = require('compute-cluster');
                        var cc = new computecluster({
                            module: sysPath.resolve(__dirname, '../modules/minWorker.js'),
                            max_backlog: -1,
                            max_processes: 5
                        });

                        spinner.start();

                        var assetsInfo = stats.toJson({
                            errorDetails: false
                        }).assets;
                        var processToRun = assetsInfo.length;

                        var originAssets = stats.compilation.assets;
                        var nextAssets = {};

                        assetsInfo.forEach(function (asset) {
                            cc.enqueue({
                                opt: opt,
                                cwd: cwd,
                                buildOpts: _this4.config.build || {},
                                assetName: asset.name
                            }, function (err, response) {
                                if (response.error) {
                                    // err log
                                    var resErr = response.error;
                                    spinner.text = '';
                                    spinner.stop();
                                    info('\n');
                                    spinner.text = 'error occured while minifying ' + resErr.assetName;
                                    spinner.fail();
                                    info(('line: ' + resErr.line + ', col: ' + resErr.col + ' ' + resErr.message + ' \n').red);

                                    // continue
                                    spinner.start();
                                }

                                // 将替换版本号的资源名取代原有名字
                                var replacedAssets = response.replacedAssets;
                                if (replacedAssets && replacedAssets.length > 0) {
                                    var originAssetName = replacedAssets[0];
                                    var nextAssetName = replacedAssets[1];
                                    if (originAssets[originAssetName]) {
                                        nextAssets[nextAssetName] = originAssets[originAssetName];
                                    }
                                }

                                processToRun -= 1;
                                spinner.text = '[Minify] ' + (assetsInfo.length - processToRun) + '/' + assetsInfo.length + ' assets';

                                if (processToRun === 0) {
                                    cc.exit();
                                    spinner.stop();

                                    // 更新 stats
                                    stats.compilation.assets = Object.keys(nextAssets).length > 0 ? nextAssets : originAssets;

                                    handleAfterPack();
                                }
                            });
                        });
                    } else {
                        handleAfterPack();
                    }

                    function handleAfterPack() {
                        spinner.stop();
                        async.series(self.packCallbacks.concat(self.hooks.afterPack).map(function (packCallback) {
                            return function (callback) {
                                var isAsync = false;

                                // 支持异步调用
                                packCallback.bind({
                                    async: function async() {
                                        isAsync = true;
                                        return callback;
                                    }
                                })(opt, stats);

                                if (!isAsync) {
                                    callback(null);
                                }
                            };
                        }), function (err) {
                            if (err) {
                                logError(err);
                                process.exit(1);
                            }

                            var statsInfo = stats.toJson({ errorDetails: false });

                            if (statsInfo.warnings.length > 0) {
                                statsInfo.warnings.map(function (warning) {
                                    logWarn(warning + '\n');
                                });
                            }

                            if (statsInfo.errors.length > 0) {
                                statsInfo.errors.map(function (err) {
                                    logError(err + '\n');
                                });
                                process.exit(1);
                            }

                            process.stdout.write('\n---------------------  YKIT EMITTED ASSETS  ---------------------\n\n');

                            var assetsInfo = self.config._config.assetsInfo || statsInfo.assets;
                            assetsInfo.map(function (asset) {
                                if (sysPath.extname(asset.name) !== '.cache') {
                                    var fileSize = UtilFs.getFileSize(path.resolve(cwd, asset.name));
                                    if (!fileSize) {
                                        fileSize = asset.size > 1024 ? (asset.size / 1024).toFixed(2) + ' KB' : asset.size + ' Bytes';
                                    }

                                    if (!/\.cache$/.test(asset.name)) {
                                        log('- '.gray + colors.bold(colors.green(asset.name)) + ' - ' + fileSize);
                                    }
                                }
                            });

                            var packDuration = Date.now() - packStartTime > 1000 ? Math.floor((Date.now() - packStartTime) / 1000) + 's' : Date.now() - packStartTime + 'ms';
                            logInfo('Bundling Finishes in ' + packDuration + '.\n');

                            callback(err, stats);
                        });
                    }
                });
            };

            async.series(this.beforePackCallbacks.map(function (beforePackItem) {
                return function (callback) {
                    // 支持旧的 beforePackCallbacks 形式
                    beforePackItem(callback, opt);
                };
            }).concat(this.hooks.beforePack.map(function (beforePackItem) {
                return function (callback) {
                    // 支持异步调用
                    var isAsync = false;
                    beforePackItem.bind({
                        async: function async() {
                            isAsync = true;
                            return callback;
                        }
                    })(opt);

                    if (!isAsync) {
                        callback(null);
                    }
                };
            })), function (err) {
                if (err) {
                    logError(err);
                    process.exit(1);
                }
                compilerProcess();
            });

            return this;
        }
    }, {
        key: 'getServerCompiler',
        value: function getServerCompiler(handler) {
            var config = this.config.getConfig();
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
    }, {
        key: '_getLintFiles',
        value: function _getLintFiles(dir, fileType) {
            var context = this.config._config.context,
                extNames = this.config._config.entryExtNames[fileType],
                lintPath = extNames.map(function (ext) {
                return sysPath.join('./**/*' + ext);
            });

            if (dir) {
                dir = sysPath.resolve(this.cwd, dir);
                try {
                    fs.statSync(dir).isDirectory() ? context = dir : lintPath = sysPath.relative(context, dir);
                } catch (e) {
                    error(e);
                }
            }

            return globby.sync(lintPath, {
                cwd: context,
                root: context,
                ignore: this.ignores
            }).map(function (lintPathItem) {
                return sysPath.resolve(context, lintPathItem);
            });
        }
    }, {
        key: '_requireUncached',
        value: function _requireUncached(module) {
            delete require.cache[require.resolve(module)];
            return require(module);
        }
    }, {
        key: '_isCacheDirExists',
        value: function _isCacheDirExists(cwd) {
            var isCacheExists = void 0;

            try {
                fs.statSync(sysPath.join(cwd, YKIT_CACHE_DIR));
                return sysPath.join(cwd, YKIT_CACHE_DIR);
            } catch (e) {
                // do nothing
            }

            return false;
        }
    }, {
        key: '_getCurrentEnv',
        value: function _getCurrentEnv() {
            if (process.argv[2] === 'pack') {
                if (process.argv.indexOf('-m') > -1) {
                    return ENVS.PRD;
                } else {
                    return ENVS.DEV;
                }
            }

            return ENVS.LOCAL;
        }
    }]);

    return Project;
}();

module.exports = Project;