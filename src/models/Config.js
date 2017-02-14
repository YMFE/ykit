'use strict';
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ForceCaseSensitivityPlugin = require('force-case-sensitivity-webpack-plugin');

const normalize = require('../utils/path').normalize;

class Config {
    constructor(cwd) {
        const dir = normalize(cwd).split('/');
        const projectDir = dir[dir.length - 1];

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
                    loader: ExtractTextPlugin.extract(
                        require.resolve('style-loader'),
                        require.resolve('css-loader')
                    )
                }],
                postLoaders: []
            },
            plugins: [
                // local plugin
                require('../plugins/extTemplatedPathPlugin.js'),
                require('../plugins/requireModulePlugin.js'),
                require('../plugins/hashPlaceholderPlugin.js'),
                new ForceCaseSensitivityPlugin()
            ],
            resolve: {
                root: [],
                extensions: ['', '.js', '.css', '.json', '.string', '.tpl'],
                alias: {}
            },
            entryExtNames: {
                css: ['.css'],
                js: ['.js', '.jsx']
            },
            requireRules: [],
            devtool: 'cheap-source-map',
            middleware: []
        };
    }

    setExports(entries) {
        if (entries && Array.isArray(entries)) {
            [].concat(entries).forEach((entry) => {
                if (typeof entry === 'string' || Array.isArray(entry)) {
                    const entryFile = Array.isArray(entry) ? entry[entry.length - 1] : entry;

                    var name = entryFile;
                    if (name.indexOf('./') == 0) {
                        name = name.substring(2);
                    } else if (name[0] == '/') {
                        name = name.substring(1);
                    }
                    this._config.entry[name] = Array.isArray(entry) ? entry : [entry];
                } else {
                    this.setGroupExports(entry.name, entry.export);
                }
            });
            return this;
        }
    }

    setGroupExports(group, exportsArr) {
        let exportGroup = this._config.entryGroup;
        exportGroup[group] = exportGroup[group] ? exportGroup[group].concat(exportsArr) : exportsArr;

        this.setExports(exportsArr);
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

    setCompiler(compileConfig, userConfig) {
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
                    }
                    return loader;
                });
            }

            // 处理 alias 中 { xyz: "/some/dir" } 的情况
            if (nextConfig.resolve && nextConfig.resolve.alias) {
                let alias = nextConfig.resolve.alias;
                Object.keys(alias).map((key) => {
                    if (key.indexOf('$') !== key.length - 1 && /^\/.+/.test(alias[key])) {
                        alias[key] = sysPath.join(this._config.cwd, alias[key]);
                    }
                });
                extend(true, this._config.resolve.alias, alias);
            }

            const context = nextConfig.context || this._config.context;
            this._config.resolve.root.push(context);

            extend(true, this._config, nextConfig);
        }
    }

    getConfig() {
        return this._config;
    }

    applyMiddleware(mw) {
        if (typeof mw === 'function') {
            this._config.middleware.push(mw);
        }
    }

    getMiddlewares() {
        return this._config.middleware;
    }

}

module.exports = Config;
