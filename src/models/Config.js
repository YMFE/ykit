'use strict';

let ExtractTextPlugin = require("extract-text-webpack-plugin");

class Config {
    constructor(cwd) {
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
                    loader: ExtractTextPlugin.extract(
                        require.resolve('style-loader'),
                        require.resolve('css-loader')
                    )
                }],
                postLoaders: []
            },
            plugins: [
                require('../plugins/extTemplatedPathPlugin.js'),
                require('../plugins/requireModulePlugin.js'),
                require('../plugins/ProgressBarPlugin.js'),
                require('../plugins/compileInfoPlugin.js'),
            ],
            resolve: {
                root: [],
                extensions: ['', '.js', '.css', '.json', '.string', '.tpl'],
                alias: {},
            },
            entryExtNames: {
                css: ['.css'],
                js: ['.js']
            },
            requireRules: [
                'node_modules|package.json:main|index.js'
            ],
            devtool: 'cheap-module-source-map'
        };
    }
    setExports(files) {
        [].concat(files).forEach((file) => {
            const entryFile = Array.isArray(file) ? file[file.length - 1] : file

            var name = entryFile.replace(/\.\w+$/g, '');
            if (name.indexOf('./') == 0) {
                name = name.substring(2);
            } else if (name[0] == '/') {
                name = name.substring(1);
            }
            this._config.entry[name] = Array.isArray(file) ? file : [file];
        });
        return this;
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
        if(syncConfig){
            if(typeof syncConfig === 'object') {
                this._config.sync = syncConfig;
            } else if (typeof syncConfig === 'function') {
                this._config.sync = syncConfig();
            }
        }
    }
    setCompiler(compileConfig) {
        if(compileConfig){
            let nextConfig = {}

            // 获取用户定义的compile配置
            if(typeof compileConfig === 'object') {
                nextConfig = compileConfig
            } else if (typeof compileConfig === 'function') {
                nextConfig = compileConfig(Object.assign({}, this._config)) || {};
            }

            // 处理context
            if(nextConfig.context && !sysPath.isAbsolute(nextConfig.context)){
                nextConfig.context = sysPath.resolve(this._config.cwd, nextConfig.context)
            }

            // 处理loaders => loader
            if(nextConfig.module && nextConfig.module.loaders){
                nextConfig.module.loaders.map((loader, i) => {
                    if(loader.loaders && !loader.loader) {
                        loader.loader = loader.loaders.join("!")
                    }
                    return loader
                })
            }


            // 处理alias
            const context = nextConfig.context || this._config.context
            const relativeContext = sysPath.relative(this._config.cwd, context)
            if(nextConfig.resolve && nextConfig.resolve.alias) {
                let alias = nextConfig.resolve.alias
                Object.keys(alias).map(function(key, i){
                    alias[key] = sysPath.relative(relativeContext, alias[key])
                })
                extend(true, this._config.resolve.alias, alias);
            }

            this._config.resolve.root.push(context)

            extend(true, this._config, nextConfig);
        }
    }
    getConfig() {
        return this._config;
    }
};

module.exports = Config;
