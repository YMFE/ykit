'use strict';

const webpack = require('webpack');
const requireg = require('requireg');
const colors = require('colors');

const path = require('path');
const fs = require('fs');

const Config = require('./Config.js');
const Manager = require('../modules/manager.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const UtilFs = require('../utils/fs.js');
const UtilPath = require('../utils/path.js');

const ENVS = {
    LOCAL: 'local',
    DEV: 'dev',
    PRD: 'prd'
};

class Project {
    constructor(cwd) {
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
        this.eslintConfig = require('../../static/eslint/eslint.json');
        this.extendConfig = this.configFile &&
            this.configFile.match(/ykit\.([\w\.]+)\.js/) &&
            this.configFile.match(/ykit\.([\w\.]+)\.js/)[1] &&
            this.configFile.match(/ykit\.([\w\.]+)\.js/)[1].replace(/\./g, '-');
        this.ignores = [
            'node_modules/**/*',
            'bower_components/**/*',
            'dev/**/*',
            'prd/**/*',
            YKIT_CACHE_DIR + '/**/*'
        ];
        this.cachePath = this._isCacheDirExists(cwd) || '';

        this.readConfig();
    }

    setCommands(nextCommands, pluginName) {
        if (Array.isArray(nextCommands)) {
            const existCommands = this.commands.map((cmd) => {
                return cmd.name;
            });
            nextCommands.forEach((cmd) => {
                if(pluginName) {
                    cmd.pluginName = pluginName;
                }

                // 检查是否有重复的命令
                if(existCommands.indexOf(cmd.name) > -1) {
                    logWarn(`Command ${cmd.name} exists. It may cause collision.`);
                }
            });

            this.commands = this.commands.concat(nextCommands);
        }
    }

    setEslintConfig(projectEslintConfig) {
        extend(true, this.eslintConfig, projectEslintConfig);
    }

    setHooks(nextHooks) {
        if(nextHooks) {
            Object.keys(this.hooks).map((hookName) => {
                if(nextHooks[hookName]) {
                    if(Array.isArray(nextHooks[hookName])) {
                        this.hooks[hookName] = this.hooks[hookName].concat(nextHooks[hookName]);
                    } else if(typeof nextHooks[hookName] === 'function') {
                        this.hooks[hookName] = this.hooks[hookName].concat([nextHooks[hookName]]);
                    }
                }
            });
        }
    }

    setProxy(proxy) {
        this.proxy = proxy || [];
    }

    setServer(server) {
        this.server = server || {};
    }

    setBuild(build) {
        this.build = extend(true, this.build, build);
    }

    readConfig() {
        if(!this.configFile) {
            // no local config, i.e., server command)
            return;
        }

        let globalConfigs = Manager.readRC().configs || [],
            localConfig = {
                cwd: this.cwd,
                _manager: Manager,
                setConfig: this.config.setCompiler.bind(this.config), // 兼容旧 api
                setCompile: this.config.setCompiler.bind(this.config), // 兼容旧 api
                setCompiler: this.config.setCompiler.bind(this.config),
                setExports: this.config.setExports.bind(this.config),
                setSync: this.config.setSync.bind(this.config),
                setCommands: this.setCommands.bind(this),
                setEslintConfig: this.setEslintConfig.bind(this),
                config: this.config.getConfig(),
                commands: this.commands,
                middlewares: this.middlewares,
                applyBeforePack: this.applyBeforePack.bind(this),
                beforePackCallbacks: this.beforePackCallbacks, // 兼容 ykit-config-yo 的 beforePackCallbacks
                packCallbacks: this.packCallbacks, // 兼容 ykit-config-yo 的 packCallbacks
                hooks: this.hooks,
                eslintConfig: this.eslintConfig,
                applyMiddleware: this.config.applyMiddleware.bind(this.config),
                env: this._getCurrentEnv(), // 默认为本地环境,
                webpack: webpack
            };

        // 获取项目配置
        const ykitConfigFile = this._requireUncached(sysPath.join(this.cwd, this.configFile));

        // 获取插件
        const ykitConfigStartWith = 'ykit-config-';
        if(Array.isArray(ykitConfigFile.plugins)) {
            this.plugins = ykitConfigFile.plugins;
        } else if(typeof ykitConfigFile.plugins === 'string'){
            this.plugins = [ykitConfigFile.plugins];
        }
        if (this.extendConfig && this.extendConfig !== 'config') {
            const pluginName = ykitConfigStartWith + this.extendConfig;
            if(this.plugins.indexOf(this.extendConfig) === -1) {
                this.plugins.push(pluginName);
            }
        }

        // 通过插件扩展配置
        this.plugins.map((pluginItem) => {
            let pluginName = '';

            // 获取插件信息
            if(typeof pluginItem === 'string') {
                pluginName = pluginItem;
            } else if(typeof pluginItem === 'object') {
                pluginName = pluginItem.name ? pluginItem.name : '';
                // 兼容以前从 options 传进去 ExtractTextPlugin
                if(typeof pluginItem.options === 'object') {
                    pluginItem.options.ExtractTextPlugin = ExtractTextPlugin;
                }
            } else {
                logError(pluginItem.name || 'Unknown' + ' plugin config error，please check local ykit.js.');
                logDoc('http://ued.qunar.com/ykit/plugins.html');
            }

            if(pluginName.indexOf(ykitConfigStartWith) === -1) {
                pluginName = ykitConfigStartWith + pluginName;
            }

            // 寻找插件模块位置
            const localSearchPath = sysPath.join(this.cwd, 'node_modules/', pluginName);
            const localSearchPathQnpm = sysPath.join(
                this.cwd,
                'node_modules/',
                '@qnpm/' + pluginName
            );
            let pluginPath = '';
            if (requireg.resolve(localSearchPath)) {
                pluginPath = localSearchPath;
            } else if (requireg.resolve(localSearchPathQnpm)) {
                pluginPath = localSearchPathQnpm;
                pluginName = '@qnpm/' + pluginName;
            }

            if (fs.existsSync(pluginPath)) {
                let module = require(pluginPath);

                // 运行插件模块
                if (module && module.config) {
                    handleExportsConfig.bind(this)(module.config, pluginItem.options);
                    this.setCommands(module.commands, pluginName); // 后者兼容以前形式
                    this.setHooks(module.hooks);
                    this.setBuild(module.build);
                }

                // 扩展 eslint 配置
                extend(true, localConfig.eslintConfig, Manager.loadEslintConfig(pluginPath));
                this.ignores.push(Manager.loadIgnoreFile(pluginPath));
            } else {
                // 添加到 process 中，防止重复多次报错
                const errorInfo = `Local ${pluginName} plugin not found，you may need to install it first.`;
                if(!(process.ykitError && process.ykitError[this.cwd + errorInfo])) {
                    logError(errorInfo);
                    logDoc('http://ued.qunar.com/ykit/plugins.html');
                }
                process.ykitError = Object.assign(process.ykitError || {}, {[this.cwd + errorInfo]: true});
            }
        });

        if (ykitConfigFile && ykitConfigFile.config) {
            const ykitJSConfig = typeof ykitConfigFile.config === 'function'
                                // 兼容以前从 options 传进去 ExtractTextPlugin
                                ? ykitConfigFile.config.bind(localConfig)({ExtractTextPlugin}, this.cwd) || {}
                                : ykitConfigFile.config || {};

            extend(true, this.config, ykitJSConfig);

            handleExportsConfig.bind(this)(ykitJSConfig);
            handleCommonsChunk.bind(this)(this.config);

            const cmds = ykitConfigFile.commands || ykitJSConfig.command || ykitJSConfig.commands;  // 后者兼容以前形式
            this.setCommands(cmds);
            this.setHooks(ykitConfigFile.hooks);
            this.setProxy(ykitConfigFile.proxy);
            this.setServer(ykitConfigFile.server);
            this.setBuild(ykitConfigFile.build);
        } else {
            logError('Local ' + this.configFile + ' config not found.');
            logDoc('http://ued.qunar.com/ykit/docs-配置.html');
        }

        // 处理 eslint
        extend(true, localConfig.eslintConfig, Manager.loadEslintConfig(this.cwd));
        this.ignores.push(Manager.loadIgnoreFile(this.cwd));

        // 处理 output
        let output = this.config.getConfig().output;
        for (let key in output) {
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


            if (typeof commonsChunk === 'object' && commonsChunk !== undefined) {
                if (typeof commonsChunk.name === 'string' && commonsChunk) {
                    chunks.push(commonsChunk.name);
                }
                vendors = commonsChunk.vendors;
                if (typeof vendors === 'object' && vendors !== undefined) {
                    var i=0;
                    for (var name in vendors) {
                        if (vendors.hasOwnProperty(name) && vendors[name]) {
                            i++;
                            chunks.push(name);
                            webpackConfig.entry[name] = Array.isArray(vendors[name]) ? vendors[name] : [vendors[name]];
                        }
                    }
                    if(i > 0){
                        chunks.push('manifest');
                    }

                }


                if (chunks.length > 0) {
                    let chunkFilename = filenameTpl.filename;
                    chunkFilename = chunkFilename.replace('[ext]', '.js');
                    webpackConfig.plugins.push(
                        new webpack.optimize.CommonsChunkPlugin({
                            name: chunks,
                            filename: chunkFilename,
                            minChunks: commonsChunk.minChunks ? commonsChunk.minChunks : 2
                        })
                    );

                }
            }
        }

        // 处理 exports.config 中 export 和旧接口

        function handleExportsConfig(exportsConfig, options) {
            if (typeof exportsConfig === 'function') {
                options = options ? options : {};
                options.ExtractTextPlugin = ExtractTextPlugin; // 兼容以前从 options 传进去 ExtractTextPlugin

                const configFunResult = exportsConfig.call(localConfig, options, this.cwd);
                exportsConfig = configFunResult ? configFunResult : exportsConfig;
            }

            if(exportsConfig.export || exportsConfig.exports) {
                let exports = null;
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

    fixCss() {
        let config = this.config.getConfig(),
            entries = config.entry,
            cssExtNames = config.entryExtNames.css,
            fps = [];

        const contextPathRelativeToCwd = sysPath.relative(config.context, this.cwd) || '.';

        for (let key in entries) {
            const entryItem = entries[key],
                entry = Array.isArray(entryItem) ? entryItem[entryItem.length - 1] : entryItem,
                extName = sysPath.extname(entry);

            // 放在cache目录下
            const cachePath = this._isCacheDirExists(this.cwd);
            if (!cachePath) {
                const newCachePath = sysPath.join(this.cwd, YKIT_CACHE_DIR);

                this.cachePath = newCachePath;
                mkdirp.sync(newCachePath);
            }

            if (cssExtNames.indexOf(extName) > -1) {
                let requireFilePath = entries[key] = './' +
                    sysPath.join(contextPathRelativeToCwd, YKIT_CACHE_DIR, entry + '.js'),
                    cacheFilePath = sysPath.join(config.context, requireFilePath);

                mkdirp.sync(sysPath.dirname(cacheFilePath));

                // 将原有entry的css路径写到js中
                if (Array.isArray(entryItem)) {
                    // clear
                    fs.writeFileSync(cacheFilePath, '', 'utf-8');

                    entryItem.forEach(cssPath => {
                        const originCssPath = sysPath.join(config.context, cssPath);
                        const requiredPath = UtilPath.normalize(
                            sysPath.relative(sysPath.dirname(cacheFilePath), originCssPath)
                        );
                        fs.appendFileSync(
                            cacheFilePath,
                            'require("' + requiredPath + '");',
                            'utf-8'
                        );
                    });
                } else {
                    const originCssPath = sysPath.join(config.context, entry);
                    const requiredPath = UtilPath.normalize(
                        sysPath.relative(sysPath.dirname(cacheFilePath), originCssPath)
                    );
                    fs.writeFileSync(cacheFilePath, 'require("' + requiredPath + '");', 'utf-8');
                }

                fps.push(cacheFilePath);
            }
        }

        // 如果没有 ExtractTextPlugin 则为项目添加一个
        const isExtractTextPluginExists = config.plugins.some((plugin) => {
            return plugin instanceof ExtractTextPlugin;
        });
        if(!isExtractTextPluginExists) {
            config.plugins.push(new ExtractTextPlugin(config.output.filename.replace('[ext]', '.css')));
        }
    }

    lint(dir, callback) {
        warn('Linting JS Files ...');

        let CLIEngine = require('eslint').CLIEngine;

        // 如果有本地eslint优先使用本地eslint
        if (requireg.resolve(sysPath.join(this.cwd, 'node_modules/', 'eslint'))) {
            CLIEngine = requireg(sysPath.join(this.cwd, 'node_modules/', 'eslint')).CLIEngine;
        }

        let files = ['.js', '.yaml', '.yml', '.json', ''].map(ext => {
            return path.join(this.cwd, '.eslintrc' + ext);
        });
        let config = UtilFs.readFileAny(files);

        // 本地无 lint 配置，创建 .eslintrc.json
        if (!config) {
            let configPath = path.join(this.cwd, '.eslintrc.json');
            fs.writeFileSync(configPath, JSON.stringify(this.eslintConfig, null, 4));
        } else {
            this.eslintConfig = config;
        }

        const cli = new CLIEngine(this.eslintConfig),
            report = cli.executeOnFiles(this._getLintFiles(dir, 'js')),
            formatter = cli.getFormatter();

        if (report.errorCount > 0) {
            info(formatter(report.results));
        }

        callback(null, !report.errorCount);
    }

    applyBeforePack(nextBeforePackCB) {
        if (typeof nextBeforePackCB === 'function') {
            this.beforePackCallbacks.push(nextBeforePackCB);
        } else if (Array.isArray(nextBeforePackCB)) {
            this.beforePackCallbacks.concat(nextBeforePackCB);
        }
    }

    getServerCompiler(handler) {
        let config = this.config.getConfig();
        config.output = extend(
            true,
            {
                path: config.output.prd.path,
                filename: '[name][ext]'
            },
            config.output.local || {}
        );

        this.fixCss();

        if (handler && typeof handler === 'function') {
            config = handler(config);
        }

        return webpack(config);
    }

    _getLintFiles(dir, fileType) {
        let context = this.config._config.context,
            extNames = this.config._config.entryExtNames[fileType],
            lintPath = extNames.map(ext => {
                return sysPath.join('./**/*' + ext);
            });

        if (dir) {
            dir = sysPath.resolve(this.cwd, dir);
            try {
                fs.statSync(dir).isDirectory()
                    ? context = dir
                    : lintPath = sysPath.relative(context, dir);
            } catch (e) {
                error(e);
            }
        }

        return globby
            .sync(lintPath, {
                cwd: context,
                root: context,
                ignore: this.ignores
            })
            .map(lintPathItem => {
                return sysPath.resolve(context, lintPathItem);
            });
    }

    _requireUncached(module) {
        delete require.cache[require.resolve(module)];
        return require(module);
    }

    _isCacheDirExists(cwd) {
        let isCacheExists;

        try {
            fs.statSync(sysPath.join(cwd, YKIT_CACHE_DIR));
            return sysPath.join(cwd, YKIT_CACHE_DIR);
        } catch (e) {
            // do nothing
        }

        return false;
    }

    _getCurrentEnv() {
        if (process.argv[2] === 'pack' || process.argv[2] === 'p' ) {
            if (process.argv.indexOf('-m') > -1) {
                return ENVS.PRD;
            } else {
                return ENVS.DEV;
            }
        }

        return ENVS.LOCAL;
    }
}

module.exports = Project;
