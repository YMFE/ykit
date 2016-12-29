'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ForceCaseSensitivityPlugin = require('force-case-sensitivity-webpack-plugin');

var normalize = require('../utils/path').normalize;

var Config = function () {
    function Config(cwd) {
        _classCallCheck(this, Config);

        var dir = normalize(cwd).split('/');
        var projectDir = dir[dir.length - 1];

        this._config = {
            cwd: cwd,
            context: sysPath.join(cwd, 'src'),
            entry: {},
            entryGroup: {},
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
            require('../plugins/extTemplatedPathPlugin.js'), require('../plugins/requireModulePlugin.js'), require('../plugins/hashPlaceholderPlugin.js'), new ForceCaseSensitivityPlugin()],
            resolve: {
                root: [],
                extensions: ['', '.js', '.css', '.json', '.string', '.tpl'],
                alias: {}
            },
            entryExtNames: {
                css: ['.css'],
                js: ['.js']
            },
            requireRules: [],
            devtool: 'cheap-source-map',
            middleware: []
        };
    }

    _createClass(Config, [{
        key: 'setExports',
        value: function setExports(entries) {
            var _this = this;

            if (entries && Array.isArray(entries)) {
                [].concat(entries).forEach(function (entry) {
                    if (typeof entry === 'string' || Array.isArray(entry)) {
                        var entryFile = Array.isArray(entry) ? entry[entry.length - 1] : entry;

                        var name = entryFile;
                        if (name.indexOf('./') == 0) {
                            name = name.substring(2);
                        } else if (name[0] == '/') {
                            name = name.substring(1);
                        }
                        _this._config.entry[name] = Array.isArray(entry) ? entry : [entry];
                    } else {
                        _this.setGroupExports(entry.name, entry.export);
                    }
                });
                return this;
            }
        }
    }, {
        key: 'setGroupExports',
        value: function setGroupExports(group, exportsArr) {
            var exportGroup = this._config.entryGroup;
            exportGroup[group] = exportGroup[group] ? exportGroup[group].concat(exportsArr) : exportsArr;

            this.setExports(exportsArr);
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
                if ((typeof syncConfig === 'undefined' ? 'undefined' : _typeof(syncConfig)) === 'object') {
                    this._config.sync = syncConfig;
                } else if (typeof syncConfig === 'function') {
                    this._config.sync = syncConfig();
                }
            }
        }
    }, {
        key: 'setCompiler',
        value: function setCompiler(compileConfig) {
            var _this2 = this;

            if (compileConfig) {
                var nextConfig = {};

                // 获取用户定义的 compile 配置
                if ((typeof compileConfig === 'undefined' ? 'undefined' : _typeof(compileConfig)) === 'object') {
                    nextConfig = compileConfig;
                } else if (typeof compileConfig === 'function') {
                    nextConfig = compileConfig(extend({}, this._config)) || {};
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
                    (function () {
                        var alias = nextConfig.resolve.alias;
                        Object.keys(alias).map(function (key) {
                            if (key.indexOf('$') !== key.length - 1 && /^\/.+/.test(alias[key])) {
                                alias[key] = sysPath.join(_this2._config.cwd, alias[key]);
                            }
                        });
                        extend(true, _this2._config.resolve.alias, alias);
                    })();
                }

                var context = nextConfig.context || this._config.context;
                this._config.resolve.root.push(context);

                extend(true, this._config, nextConfig);
            }
        }
    }, {
        key: 'getConfig',
        value: function getConfig() {
            return this._config;
        }
    }, {
        key: 'applyMiddleware',
        value: function applyMiddleware(mw) {
            if (typeof mw === 'function') {
                this._config.middleware.push(mw);
            }
        }
    }, {
        key: 'getMiddlewares',
        value: function getMiddlewares() {
            return this._config.middleware;
        }
    }, {
        key: 'applyBeforePack',
        value: function applyBeforePack(beforeCallback) {
            if (typeof beforeCallback === 'function') {
                this._config.beforePack = beforeCallback;
            }
        }
    }]);

    return Config;
}();

module.exports = Config;