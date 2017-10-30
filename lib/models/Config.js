'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

var normalize = require('../utils/path').normalize;

var Config = function () {
    function Config(cwd, configFile) {
        (0, _classCallCheck3.default)(this, Config);

        var dir = normalize(cwd).split('/');
        var projectDir = dir[dir.length - 1];

        if (configFile) {
            // 检查初始环境
            var modulePath = sysPath.join(cwd, 'node_modules');
            if (!fs.existsSync(modulePath)) {
                fs.mkdirSync(modulePath);
                fs.mkdirSync(sysPath.join(cwd, YKIT_CACHE_DIR));
            }
        }

        this._config = {
            cwd: cwd,
            context: sysPath.join(cwd, 'src'),
            entry: {},
            output: {
                local: {
                    path: './prd/',
                    filename: '[name][ext]',
                    chunkFilename: '[id].chunk.js'
                },
                dev: {
                    path: './dev/',
                    filename: '[name][ext]',
                    chunkFilename: '[id].chunk.js'
                },
                prd: {
                    path: './prd/',
                    filename: '[name].min[ext]',
                    chunkFilename: '[id].chunk.min.js'
                }
            },
            module: {
                preLoaders: [],
                loaders: [{
                    test: /\.json$/,
                    exclude: /node_modules/,
                    loader: require.resolve('json-loader')
                }, {
                    test: /\.(html|string|tpl)$/,
                    loader: require.resolve('html-loader')
                }, {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract(require.resolve('style-loader'), require.resolve('css-loader'))
                }],
                postLoaders: []
            },
            plugins: [
            // local plugin
            require('../plugins/extTemplatedPathPlugin.js'), require('../plugins/requireModulePlugin.js'), require('../plugins/hashPlaceholderPlugin.js'), new CaseSensitivePathsPlugin()],
            resolve: {
                root: [],
                extensions: ['', '.js', '.css', '.json', '.string', '.tpl'],
                alias: {}
            },
            entryExtNames: {
                css: ['.css', 'sass', 'scss', 'less'],
                js: ['.js', '.jsx', '.ts', '.tsx']
            },
            requireRules: [],
            devtool: 'cheap-source-map',
            middleware: []
        };
    }

    (0, _createClass3.default)(Config, [{
        key: 'setExports',
        value: function setExports(entries) {
            var _this = this;

            if (entries && Array.isArray(entries)) {
                [].concat(entries).forEach(function (entry) {
                    if (typeof entry === 'string' || Array.isArray(entry)) {
                        var entryFile = Array.isArray(entry) ? entry[entry.length - 1] : entry;

                        // 抽取 entry 名字
                        var name = entryFile;
                        if (name.indexOf('./') == 0) {
                            name = name.substring(2);
                        } else if (name[0] == '/') {
                            name = name.substring(1);
                        }

                        // 兼容 entry "/scripts/xxx" 和 "scripts/xxx" 的形式
                        if (typeof entry === 'string') {
                            if (entry[0] == '/') {
                                entry = '.' + entry;
                            } else if (entry[0] !== '.') {
                                entry = './' + entry;
                            }
                        }

                        _this._config.entry[name] = Array.isArray(entry) ? entry : [entry];
                    }
                });
                return this;
            }
        }
    }, {
        key: 'setOutput',
        value: function setOutput(output) {
            extend(this._config.output, output);
            return this;
        }
    }, {
        key: 'setSync',
        value: function setSync(syncConfig) {
            if (syncConfig) {
                if ((typeof syncConfig === 'undefined' ? 'undefined' : (0, _typeof3.default)(syncConfig)) === 'object') {
                    this._config.sync = syncConfig;
                } else if (typeof syncConfig === 'function') {
                    this._config.sync = syncConfig();
                }
            }
        }
    }, {
        key: 'setCompiler',
        value: function setCompiler(compileConfig, userConfig) {
            var _this2 = this;

            if (compileConfig) {
                var nextConfig = {};

                // 获取用户定义的 compile 配置
                if ((typeof compileConfig === 'undefined' ? 'undefined' : (0, _typeof3.default)(compileConfig)) === 'object') {
                    nextConfig = compileConfig;
                } else if (typeof compileConfig === 'function') {
                    nextConfig = compileConfig.bind(userConfig)(extend({}, this._config)) || {};
                }

                // 处理 context
                if (nextConfig.context && !sysPath.isAbsolute(nextConfig.context)) {
                    nextConfig.context = sysPath.resolve(this._config.cwd, nextConfig.context);
                }

                // 处理 loaders => loader
                if (nextConfig.module && nextConfig.module.loaders) {
                    nextConfig.module.loaders.map(function (loader) {
                        if (loader.loaders && !loader.loader) {
                            loader.loader = loader.loaders.join('!');
                        }
                        return loader;
                    });
                }

                // 处理 alias 中 { xyz: "/some/dir" } 的情况
                if (nextConfig.resolve && nextConfig.resolve.alias) {
                    var alias = nextConfig.resolve.alias;
                    (0, _keys2.default)(alias).map(function (key) {
                        var isRelativePath = alias[key].indexOf(USER_HOME) === -1 && alias[key].indexOf(process.cwd()) === -1;
                        if (key.indexOf('$') !== key.length - 1 && /^\/.+/.test(alias[key]) && isRelativePath) {
                            alias[key] = normalize(sysPath.join(_this2._config.cwd, alias[key]));
                        }
                    });
                    extend(true, this._config.resolve.alias, alias);
                }

                extend(true, this._config, nextConfig);
            }
        }
    }, {
        key: 'getConfig',
        value: function getConfig() {
            return this._config;
        }
    }, {
        key: 'getWebpackConfig',
        value: function getWebpackConfig() {
            return this.getConfig();
        }
    }, {
        key: 'applyMiddleware',
        value: function applyMiddleware(mw) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            if (typeof mw === 'function') {
                if (options.global) {
                    mw.global = true;
                }
                this._config.middleware.push(mw);
            }
        }
    }, {
        key: 'getMiddlewares',
        value: function getMiddlewares() {
            return this._config.middleware;
        }
    }]);
    return Config;
}();

module.exports = Config;