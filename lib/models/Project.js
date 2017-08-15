'use strict';

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
        (0, _classCallCheck3.default)(this, Project);

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
            beforeCompiling: [],
            afterPack: []
        };
        this.extendConfig = this.configFile && this.configFile.match(/ykit\.([\w\.]+)\.js/) && this.configFile.match(/ykit\.([\w\.]+)\.js/)[1] && this.configFile.match(/ykit\.([\w\.]+)\.js/)[1].replace(/\./g, '-');
        this.ignores = ['node_modules/**/*', 'bower_components/**/*', 'dev/**/*', 'prd/**/*', YKIT_CACHE_DIR + '/**/*'];
        this.cachePath = this._isCacheDirExists(cwd) || '';

        this.readConfig();
    }

    (0, _createClass3.default)(Project, [{
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
        key: 'setHooks',
        value: function setHooks(nextHooks) {
            var _this = this;

            if (nextHooks) {
                (0, _keys2.default)(this.hooks).map(function (hookName) {
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
        key: 'setProxy',
        value: function setProxy(proxy) {
            this.proxy = proxy || [];
        }
    }, {
        key: 'setServer',
        value: function setServer(server) {
            this.server = server || {};
        }
    }, {
        key: 'setBuild',
        value: function setBuild(build) {
            this.build = extend(true, this.build, build);
        }
    }, {
        key: 'readConfig',
        value: function readConfig() {
            var _this2 = this;

            if (!this.configFile) {
                // no local config, i.e., server command)
                return;
            }

            var localConfig = {
                cwd: this.cwd,
                _manager: Manager,
                setConfig: this.config.setCompiler.bind(this.config), // 兼容旧 api
                setCompile: this.config.setCompiler.bind(this.config), // 兼容旧 api
                setCompiler: this.config.setCompiler.bind(this.config),
                setExports: this.config.setExports.bind(this.config),
                setSync: this.config.setSync.bind(this.config),
                setCommands: this.setCommands.bind(this),
                config: this.config.getConfig(),
                commands: this.commands,
                middlewares: this.middlewares,
                applyBeforePack: this.applyBeforePack.bind(this),
                beforePackCallbacks: this.beforePackCallbacks, // 兼容 ykit-config-yo 的 beforePackCallbacks
                packCallbacks: this.packCallbacks, // 兼容 ykit-config-yo 的 packCallbacks
                hooks: this.hooks,
                applyMiddleware: this.config.applyMiddleware.bind(this.config),
                env: this._getCurrentEnv(), // 默认为本地环境,
                webpack: extend(webpack, { version: 3 })
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
                } else if ((typeof pluginItem === 'undefined' ? 'undefined' : (0, _typeof3.default)(pluginItem)) === 'object') {
                    pluginName = pluginItem.name ? pluginItem.name : '';
                    // 兼容以前从 options 传进去 ExtractTextPlugin
                    if ((0, _typeof3.default)(pluginItem.options) === 'object') {
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
                        _this2.setCommands(_module.commands, pluginName); // 后者兼容以前形式
                        _this2.setHooks(_module.hooks);
                        _this2.setBuild(_module.build);
                    }
                } else {
                    // 添加到 process 中，防止重复多次报错
                    var errorInfo = 'Local ' + pluginName + ' plugin not found\uFF0Cyou may need to install it first.';
                    if (!(process.ykitError && process.ykitError[_this2.cwd + errorInfo])) {
                        logError(errorInfo);
                        logDoc('http://ued.qunar.com/ykit/plugins.html');
                    }
                    process.ykitError = (0, _assign2.default)(process.ykitError || {}, (0, _defineProperty3.default)({}, _this2.cwd + errorInfo, true));
                }
            });

            if (ykitConfigFile && ykitConfigFile.config) {
                var ykitJSConfig = typeof ykitConfigFile.config === 'function'
                // 兼容以前从 options 传进去 ExtractTextPlugin
                ? ykitConfigFile.config.bind(localConfig)({ ExtractTextPlugin: ExtractTextPlugin }, this.cwd) || {} : ykitConfigFile.config || {};

                extend(true, this.config, ykitJSConfig);

                handleExportsConfig.bind(this)(ykitJSConfig);
                handleCommonsChunk.bind(this)(this.config);

                var cmds = ykitConfigFile.commands || ykitJSConfig.command || ykitJSConfig.commands; // 后者兼容以前形式
                this.setCommands(cmds);
                this.setHooks(ykitConfigFile.hooks);
                this.setProxy(ykitConfigFile.proxy);
                this.setServer(ykitConfigFile.server);
                this.setBuild(ykitConfigFile.build);
            } else {
                logError('Local ' + this.configFile + ' config not found.');
                logDoc('http://ued.qunar.com/ykit/docs-配置.html');
            }

            // 处理 output
            var output = this.config.getConfig().output;
            for (var key in output) {
                var op = output[key];
                if (op.path && !sysPath.isAbsolute(op.path)) {
                    op.path = sysPath.join(this.cwd, op.path);
                }
            }

            /**
             * 处理config.commonsChunk配置项，基于CommonsChunkPlugin插件封装
             * commonsChunk: {
                    name: 'common',
                    minChunks: 2,      //公共模块被使用的最小次数。比如配置为3，也就是同一个模块只有被3个以外的页面同时引用时才会被提取出来作为common chunks,默认为2
                    vendors: {
                        lib: ['jquery', 'underscore', 'moment'],
                        charts: ['highcharts', 'echarts']
                    }
                }
            * @param {*} config
            */
            function handleCommonsChunk(config) {
                var commonsChunk = config.commonsChunk,
                    webpackConfig = config._config,
                    chunks = [],
                    filenameTpl = webpackConfig.output[this._getCurrentEnv()],
                    vendors;

                if ((typeof commonsChunk === 'undefined' ? 'undefined' : (0, _typeof3.default)(commonsChunk)) === 'object' && commonsChunk !== undefined) {
                    if (typeof commonsChunk.name === 'string' && commonsChunk) {
                        chunks.push(commonsChunk.name);
                    }
                    vendors = commonsChunk.vendors;
                    if ((typeof vendors === 'undefined' ? 'undefined' : (0, _typeof3.default)(vendors)) === 'object' && vendors !== undefined) {
                        var i = 0;
                        for (var name in vendors) {
                            if (vendors.hasOwnProperty(name) && vendors[name]) {
                                i++;
                                chunks.push(name);
                                webpackConfig.entry[name] = Array.isArray(vendors[name]) ? vendors[name] : [vendors[name]];
                            }
                        }
                        if (i > 0) {
                            chunks.push('manifest');
                        }
                    }

                    if (chunks.length > 0) {

                        webpackConfig.plugins.push(new webpack.optimize.CommonsChunkPlugin({
                            name: chunks,
                            filename: filenameTpl.filename,
                            minChunks: commonsChunk.minChunks ? commonsChunk.minChunks : 2
                        }));
                    }
                }
            }

            // 处理 exports.config 中 export 和旧接口

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
                cssExtNames = Manager.getYkitConf('entryExtNames').css,
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
                        var requireFilePath = entries[key] = sysPath.join(contextPathRelativeToCwd, YKIT_CACHE_DIR, entry + '.js'),
                            cacheFilePath = sysPath.join(config.context, requireFilePath);

                        mkdirp.sync(sysPath.dirname(cacheFilePath));

                        // 将原有entry的css路径写到js中
                        if (Array.isArray(entryItem)) {
                            fs.writeFileSync(cacheFilePath, '', 'utf-8');

                            entryItem.forEach(function (cssPath) {
                                var originCssPath = sysPath.join(config.context, cssPath);
                                var requiredPath = UtilPath.normalize(sysPath.relative(sysPath.dirname(cacheFilePath), originCssPath));
                                fs.appendFileSync(cacheFilePath, 'require("' + requiredPath + '");', 'utf-8');
                            });

                            // HACK: 如果文件的 mtime 太近的话会触发 Webpack 多次重复编译，因此这里改为 1970/1/1
                            fs.futimesSync(fs.openSync(cacheFilePath, 'r+'), 2649600000, 2649600000);
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
        key: 'applyBeforePack',
        value: function applyBeforePack(nextBeforePackCB) {
            if (typeof nextBeforePackCB === 'function') {
                this.beforePackCallbacks.push(nextBeforePackCB);
            } else if (Array.isArray(nextBeforePackCB)) {
                this.beforePackCallbacks.concat(nextBeforePackCB);
            }
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

            if (!config || (0, _keys2.default)(config.entry).length === 0) {
                return null;
            } else {
                return webpack(config);
            }
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
            if (process.argv[2] === 'pack' || process.argv[2] === 'p') {
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