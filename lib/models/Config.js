'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ExtractTextPlugin = require("extract-text-webpack-plugin");

var Config = function () {
    function Config(cwd) {
        _classCallCheck(this, Config);

        this._config = {
            cwd: cwd,
            context: sysPath.join(cwd, 'src'),
            entry: {},
            entryGroup: {},
            output: {
                dev: {
                    path: "./dev",
                    filename: "[name][ext]"
                },
                prd: {
                    path: "./prd",
                    filename: "[name].min[ext]"
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
            plugins: [require('../plugins/extTemplatedPathPlugin.js'), require('../plugins/requireModulePlugin.js'), require('../plugins/progressBarPlugin.js'), require('../plugins/compileInfoPlugin.js')],
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
            devtool: 'cheap-source-map'
        };
    }

    _createClass(Config, [{
        key: 'setExports',
        value: function setExports(files) {
            var _this = this;

            [].concat(files).forEach(function (file) {
                var entryFile = Array.isArray(file) ? file[file.length - 1] : file;

                var name = entryFile.replace(/\.\w+$/g, '');
                if (name.indexOf('./') == 0) {
                    name = name.substring(2);
                } else if (name[0] == '/') {
                    name = name.substring(1);
                }
                _this._config.entry[name] = Array.isArray(file) ? file : [file];
            });
            return this;
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
                (function () {
                    var nextConfig = {};

                    // 获取用户定义的compile配置
                    if ((typeof compileConfig === 'undefined' ? 'undefined' : _typeof(compileConfig)) === 'object') {
                        nextConfig = compileConfig;
                    } else if (typeof compileConfig === 'function') {
                        nextConfig = compileConfig(extend({}, _this2._config)) || {};
                    }

                    // 处理context
                    if (nextConfig.context && !sysPath.isAbsolute(nextConfig.context)) {
                        nextConfig.context = sysPath.resolve(_this2._config.cwd, nextConfig.context);
                    }

                    // 处理loaders => loader
                    if (nextConfig.module && nextConfig.module.loaders) {
                        nextConfig.module.loaders.map(function (loader, i) {
                            if (loader.loaders && !loader.loader) {
                                loader.loader = loader.loaders.join("!");
                            }
                            return loader;
                        });
                    }

                    // 处理alias
                    var context = nextConfig.context || _this2._config.context;
                    var relativeContext = sysPath.relative(_this2._config.cwd, context);
                    if (nextConfig.resolve && nextConfig.resolve.alias) {
                        (function () {
                            var alias = nextConfig.resolve.alias;
                            Object.keys(alias).map(function (key, i) {
                                alias[key] = sysPath.relative(relativeContext, alias[key]);
                            });
                            extend(true, _this2._config.resolve.alias, alias);
                        })();
                    }

                    _this2._config.resolve.root.push(context);

                    extend(true, _this2._config, nextConfig);
                })();
            }
        }
    }, {
        key: 'getConfig',
        value: function getConfig() {
            return this._config;
        }
    }]);

    return Config;
}();

;

module.exports = Config;