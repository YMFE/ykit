'use strict';

let webpack = require('webpack'),
    ignore = require('ignore'),
    CLIEngine = require('eslint').CLIEngine,
    stylelint = require('stylelint');

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
        this.ignores = [];
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
            entry = config.entry,
            cssExtNames = config.entryExtNames.css,
            fps = [];

        for (let key in entry) {
            let extName = sysPath.extname(entry[key]);
            if (cssExtNames.indexOf(extName) > -1) {
                let name = sysPath.basename(entry[key], extName),
                    ofp = sysPath.join(config.context, entry[key]),
                    np = entry[key] = sysPath.join('../.cache', entry[key] + '.js'),
                    fp = sysPath.join(config.cwd, '.cache', np);

                mkdirp.sync(sysPath.dirname(fp));
                fs.writeFileSync(fp, 'require("' + sysPath.relative(sysPath.dirname(fp), ofp) + '");', 'utf-8');
                fps.push(fp);
            }
        }
        config.plugins.push(new ExtractTextPlugin(config.output.filename.replace('[ext]', '.css')));
    }
    lint(callback) {
        warn('Lint JS Files ......');
        this.eslintConfig.useEslintrc = false;

        const jsExtNames = this.config._config.entryExtNames.js,
            jsLintPath = jsExtNames.map((jsExt) => {
                return sysPath.join(this.config._config.context, '/**/*' + jsExt)
            });

        const cliengine = this.eslintConfig.linter || CLIEngine, // 优先使用项目配置的linter
            cli = new cliengine(this.eslintConfig),
            report = cli.executeOnFiles(
                globby.sync(jsLintPath, {
                    cwd: this.cwd
                })
                .filter(
                    ignore().add(this.ignores.join('\n')).createFilter()
                )
            ),
            formatter = cli.getFormatter();
        info(formatter(report.results));
        callback(null, !report.errorCount);
    }
    lintCss(callback) {
        warn('Lint CSS Files ......');

        const cssExtNames = this.config._config.entryExtNames.css,
            cssLintPath = cssExtNames.map((cssExt) => {
                return sysPath.join(this.config._config.context, '/**/*' + cssExt)
            });

        let config = {
            config: this.stylelintConfig,
            files: globby.sync(cssLintPath, {
                    cwd: this.cwd
                })
                .filter(
                    ignore().add(this.ignores.join('\n')).createFilter()
                ),
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

            try {
                childProcess.execSync('rm -rf ' + config.output.path);
            } catch (e) {}

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
}

module.exports = Project;
