'use strict';

let webpack = require('webpack');

let Config = require('./Config.js'),
    Manager = require('../modules/manager.js'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    ProgressBarPlugin = require('progress-bar-webpack-plugin');

class Project {
    constructor(cwd) {
        this.cwd = cwd;
        this.config = new Config(cwd);
        this.commands = Manager.getCommands();
        this.middlewares = [];
        this.packCallbacks = [];
        this.eslintConfig = require('../config/eslint.json');
        this.stylelintConfig = require('../config/stylelint.json');
        this.configFile = globby.sync('ykit.*.js', {
            cwd: this.cwd
        })[0] || '';
        this.extendConfig = this.configFile && this.configFile.match(/ykit\.([\w\.]+)\.js/)[1].replace(/\./g, '-');
        this.ignores = ["node_modules/**/*", "bower_components/**/*", "dev/**/*", "prd/**/*"];
        this.cachePath = sysPath.join(cwd, '.cache');
        mkdirp.sync(this.cachePath);
        this.readConfig();
    }
    check() {
        return !!this.configFile;
    }
    readConfig(options) {
        if (this.check()) {
            let userConfig = {
                    cwd: this.cwd,
                    _manager: Manager,
                    setConfig: ((setFun) => {
                        let currentConfig = this.config.getConfig(),
                            nextConfig = (setFun && setFun(currentConfig)) || {};

                        if(nextConfig.context && !sysPath.isAbsolute(nextConfig.context)){
                            nextConfig.context = sysPath.resolve(this.cwd, nextConfig.context)
                        }

                        extend(true, currentConfig, nextConfig);
                    }),
                    setExports: this.config.setExports.bind(this.config),
                    setGroupExports: this.config.setGroupExports.bind(this.config),
                    config: this.config.getConfig(),
                    commands: this.commands,
                    middlewares: this.middlewares,
                    packCallbacks: this.packCallbacks,
                    eslintConfig: this.eslintConfig,
                    stylelintConfig: this.stylelintConfig
                },
                globalConfigs = Manager.readRC().configs || [];

            this.options = options = options || {};
            options.ExtractTextPlugin = ExtractTextPlugin;

            if (this.extendConfig != 'config') {
                let moduleName = 'ykit-config-' + this.extendConfig,
                    modulePath = sysPath.join(this.cwd, 'node_modules', moduleName);

                extend(true, userConfig.eslintConfig, Manager.loadEslintConfig(modulePath));
                extend(true, userConfig.stylelintConfig, Manager.loadStylelintConfig(modulePath));
                this.ignores.push(Manager.loadIgnoreFile(modulePath));

                if (fs.existsSync(modulePath)) {
                    let module = require(modulePath);
                    if (module && module.config) {
                        module.config.call(userConfig, options, this.cwd);
                    }
                } else {
                    let item = globalConfigs.filter((item) => item.name == moduleName)[0];
                    if (item) {
                        let module = require(item.path);

                        extend(true, userConfig.eslintConfig, Manager.loadEslintConfig(item.path));
                        extend(true, userConfig.stylelintConfig, Manager.loadStylelintConfig(item.path));
                        this.ignores.push(Manager.loadIgnoreFile(item.path));

                        if (module && module.config) {
                            module.config.call(userConfig, options, this.cwd);
                        }
                    } else if ((Manager.reloadRC().configs || []).some((item) => item.name == moduleName)) {
                        return this.readConfig(options);
                    } else {
                        warn('没有找到 ykit-config-' + this.extendConfig + ' 配置模块！');
                    }
                }
            }

            let configMethod = require(sysPath.join(this.cwd, this.configFile));
            extend(true, userConfig.eslintConfig, Manager.loadEslintConfig(this.cwd));
            extend(true, userConfig.stylelintConfig, Manager.loadStylelintConfig(this.cwd));
            this.ignores.push(Manager.loadIgnoreFile(this.cwd));

            if (configMethod) {
                if (Array.isArray(configMethod)) {
                    this.config.setExports(configMethod);
                }
                if (typeof configMethod.config == 'function') {
                    configMethod.config.call(userConfig, options, this.cwd);
                } else {
                    error(this.configFile + ' 没有 exports 正确的方法！');
                    return this;
                }
            }

            let output = this.config.getConfig().output;
            for (let key in output) {
                var op = output[key];
                if (!sysPath.isAbsolute(op.path)) {
                    op.path = sysPath.join(this.cwd, op.path);
                }
            }
        }
        return this;
    }
    fixCss() {
        let config = this.config.getConfig(),
            entries = config.entry,
            cssExtNames = config.entryExtNames.css,
            fps = [];

        const contextPathRelativeToCwd = sysPath.relative(config.context, this.cwd) || '.'

        for (let key in entries) {
            const entryItem = entries[key],
                entry = Array.isArray(entryItem) ? entryItem[entryItem.length - 1] : entryItem,
                extName = sysPath.extname(entry);

            if (cssExtNames.indexOf(extName) > -1) {
                let requireFilePath = entries[key] = './' + sysPath.join(contextPathRelativeToCwd, '/.cache', entry + '.js'),
                    cacheFilePath = sysPath.join(config.context, requireFilePath);

                mkdirp.sync(sysPath.dirname(cacheFilePath));

                // 将原有entry的css路径写到js中
                if(Array.isArray(entryItem)) {
                    // clear
                    fs.writeFileSync(cacheFilePath, '', 'utf-8');

                    entryItem.forEach((cssPath, i) => {
                        const originCssPath = sysPath.join(config.context, cssPath)
                        const requiredPath = this._normalizePath(sysPath.relative(sysPath.dirname(cacheFilePath), originCssPath))
                        fs.appendFileSync(
                            cacheFilePath,
                            'require("' + requiredPath + '");',
                            'utf-8'
                        );
                    })
                } else {
                    const originCssPath = sysPath.join(config.context, entry)
                    const requiredPath = this._normalizePath(sysPath.relative(sysPath.dirname(cacheFilePath), originCssPath))
                    fs.writeFileSync(
                        cacheFilePath,
                        'require("' + requiredPath + '");',
                        'utf-8'
                    );
                }

                fps.push(cacheFilePath);
            }
        }
        config.plugins.push(new ExtractTextPlugin(config.output.filename.replace('[ext]', '.css')));
    }

    lint(dir, callback) {
        const CLIEngine = require('eslint').CLIEngine;

        warn('Linting JS Files ...');
        this.eslintConfig.useEslintrc = false;

        const cliengine = this.eslintConfig.linter || CLIEngine, // 优先使用项目配置的linter
            cli = new cliengine(this.eslintConfig),
            report = cli.executeOnFiles(this._getLintFiles(dir, 'js')),
            formatter = cli.getFormatter();

        if(report.errorCount > 0) {
            info(formatter(report.results));
        }

        callback(null, !report.errorCount);
    }

    lintCss(dir, callback) {
        const stylelint = require('stylelint');

        warn('Linting CSS Files ...');

        let config = {
            config: this.stylelintConfig,
            files: this._getLintFiles(dir, 'css'),
            syntax: 'scss',
            formatter: 'verbose'
        };

        if (config.files.length) {
            stylelint.lint(config).then(function(data) {
                if (data.errored) {
                    console.log(data.output);
                }
                callback(null, !data.errored);
            }).catch(() => {
                callback(true);
            })
        } else {
            callback(null, true);
        }
    }

    pack(opt, callback) {
        let config = this.config.getConfig();

        let process = () => {

            if (opt.min) {
                config.plugins.push(new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    }
                }));
                config.output = config.output.prd;
            } else {
                config.output = config.output.dev;
            }

            this.fixCss();

            if (opt.sourcemap) {
                config.devtool = opt.sourcemap
            }

            if(opt.clean) {
                try {
                    childProcess.execSync('rm -rf ' + config.output.path);
                } catch (e) {}
            }

            config.plugins.push(new ProgressBarPlugin())

            webpack(config, (err, stats) => {
                globby.sync('**/*.cache', {
                        cwd: config.output.path
                    })
                    .map((p) => sysPath.join(config.output.path, p))
                    .forEach((fp) => fs.unlinkSync(fp));

                if (!err) {
                    let statsInfo = stats.toJson({
                        errorDetails: false
                    });

                    if (statsInfo.errors.length > 0) {
                        statsInfo.errors.map((err) => {
                            error(err.red);
                            info();
                        })
                    }
                    if (statsInfo.warnings.length > 0) {
                        statsInfo.warnings.map((warning) => {
                            warn(err.yellow);
                            info();
                        })
                    }
                    statsInfo.assets.map((asset) => {
                        const size = asset.size > 1024 ?
                            (asset.size / 1024).toFixed(2) + ' kB' :
                            asset.size + ' bytes';
                        if (!/\.cache$/.test(asset.name)) {
                            log('packed asset: '.gray + asset.name + ' - ' + size);
                        }
                    })
                    info();
                    this.packCallbacks.forEach(cb => cb(opt, stats));
                }

                callback(err, stats);
            });
        }

        if (opt.lint) {
            async.series([
                (callback) => this.lint(callback),
                (callback) => this.lintCss(callback)
            ], (err, results) => {
                if (!err) {
                    if (results[0] && results[1]) {
                        process();
                    }
                } else {
                    error(err.stack);
                }
            });
        } else {
            process();
        }

        return this;
    }

    getServerCompiler() {
        let config = this.config.getConfig();
        config.output = {
            path: '/cache',
            filename: '[name][ext]'
        };
        this.fixCss();
        return webpack(config);
    }

    _getLintFiles(dir, fileType) {
        let context = this.config._config.context,
            extNames = this.config._config.entryExtNames[fileType],
            lintPath = extNames.map((ext) => {
                return sysPath.join('./**/*' + ext)
            });

        if(dir) {
            dir = sysPath.resolve(this.cwd, dir)
            try {
                fs.statSync(dir).isDirectory() ? context = dir : lintPath = sysPath.relative(context, dir)
            } catch (e) {
                error(e);
                process.exit(1);
            }
        }

        return globby.sync(lintPath, {
            cwd: context,
            root: context,
            ignore: this.ignores
        }).map((lintPathItem) => {
            return sysPath.resolve(context, lintPathItem)
        })
    }

    _normalizePath(str, stripTrailing) {
    	if (typeof str !== 'string') {
    		throw new TypeError('expected a string');
    	}
    	str = str.replace(/[\\\/]+/g, '/');
    	if (stripTrailing !== false) {
    		str = str.replace(/\/$/, '');
    	}
    	return str;
    }
}

module.exports = Project;
