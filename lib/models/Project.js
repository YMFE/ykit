'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var webpack = require('webpack');
var requireg = require('requireg');

var path = require('path');
var fs = require('fs');

var Config = require('./Config.js');
var Manager = require('../modules/manager.js');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ForceCaseSensitivityPlugin = require('force-case-sensitivity-webpack-plugin');

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
        this.plugins = [];
        this.config = new Config(cwd);
        this.commands = Manager.getCommands();
        this.middlewares = [];
        this.beforePackCallbacks = [];
        this.packCallbacks = [];
        this.hooks = {
            beforePack: [],
            afterPack: []
        };
        this.eslintConfig = require('../config/eslint.json');
        this.configFile = globby.sync(['ykit.*.js', 'ykit.js'], { cwd: this.cwd })[0] || '';
        this.extendConfig = this.configFile && this.configFile.match(/ykit\.([\w\.]+)\.js/) && this.configFile.match(/ykit\.([\w\.]+)\.js/)[1] && this.configFile.match(/ykit\.([\w\.]+)\.js/)[1].replace(/\./g, '-');
        this.ignores = ['node_modules/**/*', 'bower_components/**/*', 'dev/**/*', 'prd/**/*', YKIT_CACHE_DIR + '/**/*'];
        this.cachePath = this._isCacheDirExists(cwd) || '';

        this.readConfig();
    }

    _createClass(Project, [{
        key: 'check',
        value: function check() {
            return !!this.configFile;
        }
    }, {
        key: 'setCommands',
        value: function setCommands(nextCommands) {
            var _this = this;

            if (Array.isArray(nextCommands)) {
                (function () {
                    // 检查是否有重复的命令
                    var existCommands = _this.commands.map(function (cmd) {
                        return cmd.name;
                    });
                    nextCommands.forEach(function (cmd) {
                        if (existCommands.indexOf(cmd.name) > -1) {
                            warn('\u547D\u4EE4 ' + cmd.name + ' \u5DF2\u7ECF\u5B58\u5728\uFF0C\u53EF\u80FD\u4F1A\u9020\u6210\u51B2\u7A81\u3002\n');
                        }
                    });

                    _this.commands = _this.commands.concat(nextCommands);
                })();
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
            var _this2 = this;

            if (nextHooks) {
                Object.keys(this.hooks).map(function (hookName) {
                    if (nextHooks[hookName]) {
                        if (Array.isArray(nextHooks[hookName])) {
                            _this2.hooks[hookName] = _this2.hooks[hookName].concat(nextHooks[hookName]);
                        } else if (typeof nextHooks[hookName] === 'function') {
                            _this2.hooks[hookName] = _this2.hooks[hookName].concat([nextHooks[hookName]]);
                        }
                    }
                });
            }
        }
    }, {
        key: 'readConfig',
        value: function readConfig(options) {
            var _this3 = this;

            if (this.check()) {
                var op;

                var _ret2 = function () {
                    var globalConfigs = Manager.readRC().configs || [],
                        userConfig = {
                        cwd: _this3.cwd,
                        _manager: Manager,
                        setConfig: _this3.config.setCompiler.bind(_this3.config), // 兼容旧api
                        setCompile: _this3.config.setCompiler.bind(_this3.config), // 兼容旧api
                        setCompiler: _this3.config.setCompiler.bind(_this3.config),
                        setExports: _this3.config.setExports.bind(_this3.config),
                        setGroupExports: _this3.config.setGroupExports.bind(_this3.config),
                        setSync: _this3.config.setSync.bind(_this3.config),
                        setCommands: _this3.setCommands.bind(_this3),
                        setEslintConfig: _this3.setEslintConfig.bind(_this3),
                        config: _this3.config.getConfig(),
                        commands: _this3.commands,
                        middlewares: _this3.middlewares,
                        // 兼容 ykit-config-yo 的 beforePackCallbacks 和 packCallbacks
                        applyBeforePack: _this3.applyBeforePack.bind(_this3),
                        beforePackCallbacks: _this3.beforePackCallbacks,
                        packCallbacks: _this3.packCallbacks,
                        hooks: _this3.hooks,
                        eslintConfig: _this3.eslintConfig,
                        applyMiddleware: _this3.config.applyMiddleware.bind(_this3.config),
                        env: _this3._getCurrentEnv(), // 默认为本地环境,
                        webpack: webpack
                    };

                    // 从基础配置往下传给 plugins 和项目配置的 options
                    _this3.options = options = options || {};
                    options.ExtractTextPlugin = ExtractTextPlugin;

                    // 获取项目配置中的插件
                    var configMethod = _this3._requireUncached(sysPath.join(_this3.cwd, _this3.configFile));
                    var ykitConfigStartWith = 'ykit-config-';
                    if (Array.isArray(configMethod.plugins)) {
                        _this3.plugins = configMethod.plugins;
                    } else if (typeof configMethod.plugins === 'string') {
                        _this3.plugins = [configMethod.plugins];
                    }

                    // 通过配置文件名获取插件
                    if (_this3.extendConfig && _this3.extendConfig !== 'config') {
                        var pluginName = ykitConfigStartWith + _this3.extendConfig;
                        if (_this3.plugins.indexOf(_this3.extendConfig) === -1) {
                            _this3.plugins.push(pluginName);
                        }
                    }

                    // 通过插件扩展配置
                    _this3.plugins.map(function (pluginName) {
                        if (pluginName.indexOf(ykitConfigStartWith) === -1) {
                            pluginName = ykitConfigStartWith + pluginName;
                        }

                        var localSearchPath = sysPath.join(_this3.cwd, 'node_modules/', pluginName);
                        var localSearchPathQnpm = sysPath.join(_this3.cwd, 'node_modules/', '@qnpm/' + pluginName);
                        var pluginPath = '';

                        if (requireg.resolve(localSearchPath)) {
                            pluginPath = localSearchPath;
                        } else if (requireg.resolve(localSearchPathQnpm)) {
                            pluginPath = localSearchPathQnpm;
                            pluginName = '@qnpm/' + pluginName;
                        }

                        if (fs.existsSync(pluginPath)) {
                            var _module = require(pluginPath);

                            if (_module && _module.config) {
                                _module.config.call(userConfig, options, _this3.cwd);
                            }

                            // 扩展 eslint 配置
                            extend(true, userConfig.eslintConfig, Manager.loadEslintConfig(pluginPath));
                            _this3.ignores.push(Manager.loadIgnoreFile(pluginPath));
                        } else {
                            // 寻找全局插件
                            var item = globalConfigs.filter(function (item) {
                                return item.name == pluginName;
                            })[0];
                            if (item) {
                                var _module2 = require(item.path);

                                extend(true, userConfig.eslintConfig, Manager.loadEslintConfig(item.path));
                                _this3.ignores.push(Manager.loadIgnoreFile(item.path));

                                if (_module2 && _module2.config) {
                                    _module2.config.call(userConfig, options, _this3.cwd);
                                }
                            } else {
                                warn('没有找到 ' + pluginName + ' 配置插件.');
                            }
                        }
                    });

                    extend(true, userConfig.eslintConfig, Manager.loadEslintConfig(_this3.cwd));
                    _this3.ignores.push(Manager.loadIgnoreFile(_this3.cwd));

                    if (configMethod) {
                        var _handleConfigObj = function _handleConfigObj(userConfigObj) {
                            var _this4 = this;

                            if (!userConfigObj) {
                                return;
                            }

                            var exports = null;
                            if (Array.isArray(userConfigObj.export)) {
                                exports = userConfigObj.export;
                            } else if (Array.isArray(userConfigObj.exports)) {
                                exports = userConfigObj.exports;
                            }

                            if (exports) {
                                exports = exports.filter(function (item) {
                                    if ((typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object') {
                                        _this4.config.setGroupExports(item.name, item.export);
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
                        };

                        // 如果传入的是一个简单数组
                        if (Array.isArray(configMethod)) {
                            _this3.config.setExports(configMethod);
                        }

                        // 如果传入的是一个处理配置方法或对象
                        if (typeof configMethod.config === 'function') {
                            _handleConfigObj.bind(_this3)(configMethod.config.call(userConfig, options, _this3.cwd));
                        } else if (_typeof(configMethod.config) === 'object') {
                            _handleConfigObj.bind(_this3)(configMethod.config);
                        } else {
                            error(_this3.configFile + ' 设置有误，请参考文档 ' + 'http://ued.qunar.com/ykit/docs-%E9%85%8D%E7%BD%AE.html'.underline);
                            return {
                                v: _this3
                            };
                        }
                    }

                    var output = _this3.config.getConfig().output;
                    for (var key in output) {
                        op = output[key];

                        if (op.path && !sysPath.isAbsolute(op.path)) {
                            op.path = sysPath.join(_this3.cwd, op.path);
                        }
                    }
                }();

                if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
            }
            return this;
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
            var _this5 = this;

            warn('Linting JS Files ...');

            var CLIEngine = require('eslint').CLIEngine;

            // 如果有本地eslint优先使用本地eslint
            if (requireg.resolve(sysPath.join(this.cwd, 'node_modules/', 'eslint'))) {
                CLIEngine = requireg(sysPath.join(this.cwd, 'node_modules/', 'eslint')).CLIEngine;
            }

            var files = ['.js', '.yaml', '.yml', '.json', ''].map(function (ext) {
                return path.join(_this5.cwd, '.eslintrc' + ext);
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
            var _this6 = this;

            var self = this,
                packStartTime = Date.now(),
                config = this.config.getConfig();

            UtilFs.deleteFolderRecursive(this.cachePath);

            // 添加检查大小写插件
            config.plugins.push(new ForceCaseSensitivityPlugin());

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

                _this6.fixCss();

                webpack(config, function (err, stats) {
                    var cwd = config.output.path;

                    globby.sync('**/*.cache', { cwd: cwd }).map(function (p) {
                        return sysPath.join(config.output.path, p);
                    }).forEach(function (fp) {
                        fs.unlinkSync(fp);
                    });

                    // 压缩
                    if (opt.min) {
                        (function () {
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
                                    buildOpts: _this6.config.build || {},
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

                                        logTime('minify complete!');

                                        // 更新 stats
                                        stats.compilation.assets = Object.keys(nextAssets).length > 0 ? nextAssets : originAssets;

                                        handleAfterPack();
                                    }
                                });
                            });
                        })();
                    } else {
                        handleAfterPack();
                    }

                    function handleAfterPack() {
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
                            var statsInfo = stats.toJson({ errorDetails: false });

                            process.stdout.write('\n--------------------------  YKIT PACKED ASSETS  --------------------------\n\n');

                            if (statsInfo.errors.length > 0) {
                                statsInfo.errors.map(function (err) {
                                    error(err.red + '\n');
                                });
                            }
                            if (statsInfo.warnings.length > 0) {
                                statsInfo.warnings.map(function (warning) {
                                    warn(warning.yellow + '\n');
                                });
                            }

                            var assetsInfo = self.config._config.assetsInfo || statsInfo.assets;
                            assetsInfo.map(function (asset) {
                                if (sysPath.extname(asset.name) !== '.cache') {
                                    var fileSize = UtilFs.getFileSize(path.resolve(cwd, asset.name));
                                    if (!fileSize) {
                                        fileSize = asset.size > 1024 ? (asset.size / 1024).toFixed(2) + ' KB' : asset.size + ' Bytes';
                                    }

                                    if (!/\.cache$/.test(asset.name)) {
                                        log('- '.gray + asset.name + ' - ' + fileSize);
                                    }
                                }
                            });

                            var packDuration = Date.now() - packStartTime > 1000 ? Math.floor((Date.now() - packStartTime) / 1000) + 's' : Date.now() - packStartTime + 'ms';
                            log('Packing Finished in ' + packDuration + '.\n');

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
                    process.exit(1);
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

            try {
                fs.statSync(sysPath.join(cwd, '.cache'));
                return sysPath.join(cwd, '.cache');
            } catch (e) {
                isCacheExists == false;
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