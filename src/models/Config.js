'use strict';
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const normalize = require('../utils/path').normalize;
const Manager = require('../modules/GlobalManager');
const HappyPack = require('happypack');

const envNames = ['local', 'dev', 'prd'];

class Config {
    constructor(cwd) {
        const dir = normalize(cwd).split('/');
        const projectDir = dir[dir.length - 1];

        // 检查初始环境
        const modulePath = sysPath.join(cwd, 'node_modules');
        if(!fs.existsSync(modulePath)) {
            fs.mkdirSync(modulePath);
            fs.mkdirSync(sysPath.join(cwd, YKIT_CACHE_DIR));
        }

        const extraConfig = {
            cwd: cwd,
            entryExtNames: {
                css: ['.css', '.less', '.sass', '.scss'],
                js: ['.js', '.jsx', '.ts', '.tsx']
            },
            requireRules: [
                'fekit_modules|fekit.config:main|./src/index.js'
            ],
            middleware: []
        };

        this._config = extend({
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
                    // 这里添加 __ykit__ 标识是为了当有其它 js loader 时候去掉此项默认配置
                    test: /\.(js|jsx|__ykit__)$/,
                    exclude: /node_modules/,
                    loader: require.resolve('happypack/loader')
                }, {
                    test: /\.json$/,
                    exclude: /node_modules/,
                    loader: require.resolve('json-loader')
                }, {
                    test: /\.(html|string|tpl)$/,
                    loader: require.resolve('html-loader')
                }, {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract(
                        require.resolve('css-loader')
                    )
                }],
                postLoaders: [],
                rules: []
            },
            plugins: [
                require('../plugins/extTemplatedPathPlugin.js'),
                require('../plugins/requireModulePlugin.js'),
                require('../plugins/hashPlaceholderPlugin.js'),
                new CaseSensitivePathsPlugin(),
                new webpack.HashedModuleIdsPlugin(),
                new extend(HappyPack({
                    loaders: [
                        {
                            loader: require.resolve('babel-loader'),
                            test: /\.(js|jsx)$/,
                            exclude: /node_modules/,
                            query: {
                                cacheDirectory: true,
                                presets: [
                                    [require.resolve('babel-preset-env'), {
                                        targets: [
                                            '> 1%',
                                            'last 3 versions',
                                            'ios 8',
                                            'android 4.2'
                                        ],
                                        useBuiltIns: 'usage',
                                        debug: false,
                                        modules: false
                                    }]
                                ],
                                plugins: []
                            }
                        }
                    ],
                    threads: 4,
                    verbose: false
                }), {__ykit__: true})
            ],
            resolve: {
                root: [],
                modules: ['node_modules'],
                extensions: ['.js', '.css', '.json', '.string', '.tpl'],
                alias: {}
            },
            devtool: 'source-map'
        }, extraConfig);

        Manager.mixYkitConf(extraConfig);
    }

    setExports(entries) {
        if (entries && Array.isArray(entries)) {
            [].concat(entries).forEach((entry) => {
                if (typeof entry === 'string' || Array.isArray(entry)) {
                    const entryFile = Array.isArray(entry) ? entry[entry.length - 1] : entry;

                    // 抽取 entry 名字
                    var name = entryFile;
                    if (name.indexOf('./') == 0) {
                        name = name.substring(2);
                    } else if (name[0] == '/') {
                        name = name.substring(1);
                    }

                    // 兼容 entry "/scripts/xxx" 和 "scripts/xxx" 的形式
                    if(typeof entry === 'string') {
                        if (entry[0] == '/') {
                            entry = '.' + entry;
                        } else if(entry[0] !== '.') {
                            entry = './' + entry;
                        }
                    }

                    this._config.entry[name] = Array.isArray(entry) ? entry : [entry];
                }
            });
            return this;
        }
    }

    setOutput(output) {
        extend(this._config.output, output);
        return this;
    }

    setSync(syncConfig) {
        if (syncConfig) {
            if (typeof syncConfig === 'object') {
                this._config.sync = syncConfig;
            } else if (typeof syncConfig === 'function') {
                this._config.sync = syncConfig();
            }
        }
    }

    setCompiler(compileConfig, userConfig, env) {
        if (compileConfig) {
            let nextConfig = {};

            // 获取用户定义的 compile 配置
            if (typeof compileConfig === 'object') {
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
                nextConfig.module.loaders.map((loader) => {
                    if (loader.loaders && !loader.loader) {
                        loader.loader = loader.loaders.join('!');
                        delete loader.loaders;
                    }
                    return loader;
                });
            }

            // 处理 alias 中 { xyz: "/some/dir" } 的情况
            if (nextConfig.resolve && nextConfig.resolve.alias) {
                let alias = nextConfig.resolve.alias;
                Object.keys(alias).map((key) => {
                    const isRelativePath = alias[key].indexOf(USER_HOME) === -1
                                        && alias[key].indexOf(process.cwd()) === -1;
                    if (key.indexOf('$') !== key.length - 1
                        && /^\/.+/.test(alias[key])
                        && isRelativePath
                    ) {
                        alias[key] = normalize(sysPath.join(this._config.cwd, alias[key]));
                    }
                });
                extend(true, this._config.resolve.alias, alias);
            }

            // 处理 output
            const userOutputObj = extend({}, nextConfig.output);
            envNames.forEach(name => delete userOutputObj[name]);
            nextConfig.output[env] = extend({}, nextConfig.output[env], userOutputObj);

            extend(true, this._config, nextConfig);
        }
    }

    getConfig() {
        return this._config;
    }

    getWebpackConfig() {
        return this.getConfig();
    }

    applyMiddleware(mw, options = {}) {
        if (typeof mw === 'function') {
            if(options.global) {
                mw.global = true;
            }
            Manager.mixYkitConf({
                middleware: Manager.getYkitConf('middleware').concat(mw)
            });
        }
    }

    getMiddlewares() {
        return Manager.getYkitConf('middleware');
    }

}

module.exports = Config;
