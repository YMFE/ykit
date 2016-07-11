'use strict';

let ExtractTextPlugin = require("extract-text-webpack-plugin");

class Config {
    constructor(cwd) {
        this._config = {
            cwd: cwd,
            context: sysPath.join(cwd, 'src'),
            entry: {},
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
                loaders: [{
                    test: /\.json$/,
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
                }]
            },
            plugins: [
                require('../plugins/extTemplatedPathPlugin.js'),
                require('../plugins/requireModulePlugin.js')
            ],
            resolve: {
                root: [],
                extensions: ['', '.js', '.css', '.json', '.string', '.tpl'],
                alias: {}
            },
            entryExtNames: {
                css: ['.css']
            },
            requireRules: [
                'node_modules|package.json:main|index.js'
            ],
            devtool: 'cheap-module-source-map'
        };
    }
    setExports(files) {
        [].concat(files).forEach((file) => {
            var name = file.replace(/\.\w+$/g, '');
            if (name.indexOf('./') == 0) {
                name = name.substring(2);
            } else if (name[0] == '/') {
                name = name.substring(1);
            }
            this._config.entry[name] = file;
        });
        return this;
    }
    setOutput(output) {
        extend(this._config.output, output);
        return this;
    }
    getConfig() {
        return this._config;
    }
};

module.exports = Config;
