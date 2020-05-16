'use strict';
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const { extraConfig } = require('./constans');
const normalize = require('../utils/path').normalize;

class Config {
    constructor(cwd, configFile) {

        const dir = normalize(cwd).split('/');
        const projectDir = dir[dir.length - 1];

        if(configFile) {
            // 检查初始环境
            const modulePath = sysPath.join(cwd, 'node_modules');
            if(!fs.existsSync(modulePath)) {
                fs.mkdirSync(modulePath);
                fs.mkdirSync(sysPath.join(cwd, YKIT_CACHE_DIR));
            }
        } else {
            // logWarn('No ykit config file found.', cwd);
        }


        this.cwd = cwd;
        this._config = {
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
                    chunkFilename: '[id].chunk'
                },
                prd: {
                    path: './prd/',
                    filename: '[name]@[chunkhash][ext]',
                chunkFilename: '[id].chunk@[chunkhash].js'
                }
            },
            mode:'none',
            module: {
              //  preLoaders: [],
                rules: [{
                    test: /\.json$/,
                    exclude: /node_modules/,
                    use: [
                      {
                        loader:require.resolve('json-loader')
                      }
                    ]
                }, {
                    test: /\.(html|string|tpl)$/,
                    use: [
                      {
                        loader:require.resolve('html-loader')
                      }
                    ]
                }, {
                    test: /\.css$/,
                    use:  ExtractTextPlugin.extract({
                      fallback: require.resolve('style-loader'),
                      use: [
                        require.resolve('css-loader')
                      ]
                    })
                }],
              //  postLoaders: []
            },
            plugins: [
                // local plugin
                //filename : '[name]@[chunkhash][ext]',
                  // new ExtractTextPlugin({
                  //   filename:  (getPath) => {
                  //     console.log('getPath----',getPath('[name]-[chunkhash].css'))
                  //     return getPath('[name]-[chunkhash].css')
                  //   //  return getPath('css/[name].css').replace('css/js', 'css');
                  //   },
                  // //  chunkFilename: '[id].chunk@[chunkhash].css',
                  //   allChunks:true
                  // }),
                 require('../plugins/extTemplatedPathPlugin.js'),
                 // require('../plugins/requireModulePlugin.js'),
                require('../plugins/hashPlaceholderPlugin.js'),
                new CaseSensitivePathsPlugin()

            ],
            resolve: {
                extensions: [ '.js', '.jsx', '.ts', '.tsx', '.vue', '.scss', '.css', '.less', '.json', '.string', '.tpl'],
                alias: {}
            },
            resolveLoader: {
              moduleExtensions: ['-loader']
            },
            devtool: 'cheap-source-map'
        };
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
        //  console.log('nextConfig-----',nextConfig.module)
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

            extend(true, this._config, nextConfig);
        }
    }

    getConfig() {
        // const __extraConfig = extraConfig(this.cwd)
        // return extend(true, this._config, __extraConfig);
        return this._config
    }

    removeCustonConfig(config) {
        const __extraConfig = extraConfig(this.cwd)
        const __extraKey = Object.keys(__extraConfig)
        let __config = extend({}, config)
        for(let key in __config) {
          if(__extraKey.indexOf(key) > -1) {
            delete __config[key]
          }

        }
        return __config
    }

    getWebpackConfig() {
        return this.getConfig();
    }

    applyMiddleware(mw, options = {}) {
        if (typeof mw === 'function') {
            if(options.global) {
                mw.global = true;
            }
            this._config.middleware.push(mw);
        }
    }

    getMiddlewares() {
        return this._config.middleware;
    }

}

module.exports = Config;
