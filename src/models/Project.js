'use strict';

let webpack = require('webpack'),
    ignore = require('ignore'),
    CLIEngine = require('eslint').CLIEngine,
    lintConfigFile = require("eslint/lib/config/config-file.js"),
    CSSLint = require('csslint').CSSLint;

CSSLint.addFormatter(require('csslint-stylish'));

let Config = require('./Config.js'),
    Manager = require('../modules/manager.js'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    ProgressBarPlugin = require('progress-bar-webpack-plugin');

class Project {
    constructor(cwd) {
        this.cwd = cwd;
        this.config = new Config(cwd);
        this.commands = [];
        this.middlewares = [];
        this.lintConfig = {};
        this.configFile = globby.sync('ykit.*.js', {
            cwd: this.cwd
        })[0] || '';
        this.extendConfig = this.configFile && this.configFile.match(/ykit\.([\w\.]+)\.js/)[1].replace(/\./g, '-');
        this.ignores = [];
        this.readConfig();
    }
    check() {
        return !!this.configFile;
    }
    readConfig(options) {
        if (this.check()) {
            let userConfig = {
                    setConfig: function(conf) {
                        extnd(true, this.config.getConfig(), conf);
                    },
                    setExports: this.config.setExports.bind(this.config),
                    config: this.config.getConfig(),
                    commands: this.commands,
                    middlewares: this.middlewares,
                    lintConfig: this.lintConfig
                },
                globalConfigs = Manager.readRC().configs || [];

            this.options = options = options || {};
            options.ExtractTextPlugin = ExtractTextPlugin;

            if (this.extendConfig != 'config') {
                let moduleName = 'ykit-config-' + this.extendConfig,
                    modulePath = sysPath.join(this.cwd, 'node_modules', moduleName),
                    lintConfPath = lintConfigFile.getFilenameForDirectory(modulePath),
                    ignoreFile = sysPath.join(modulePath, '.lintignore');

                if (lintConfPath && lintConfPath.indexOf('package.json') == -1) {
                    extend(true, userConfig.lintConfig, lintConfigFile.load(lintConfPath));
                }

                if (fs.existsSync(ignoreFile)) {
                    this.ignores.push(fs.readFileSync(ignoreFile, 'UTF-8'));
                }

                if (fs.existsSync(modulePath)) {
                    let module = require(modulePath);
                    if (module && module.config) {
                        module.config.call(userConfig, options, this.cwd);
                    }
                } else {
                    let item = globalConfigs.filter((item) => item.name == moduleName)[0];
                    if (item) {
                        let module = require(item.path),
                            lintConfPath = lintConfigFile.getFilenameForDirectory(item.path),
                            ignoreFile = sysPath.join(modulePath, '.lintignore');

                        if (lintConfPath && lintConfPath.indexOf('package.json') == -1) {
                            extend(true, userConfig.lintConfig, lintConfigFile.load(lintConfPath));
                        }

                        if (fs.existsSync(ignoreFile)) {
                            this.ignores.push(fs.readFileSync(ignoreFile, 'UTF-8'));
                        }

                        if (module && module.config) {
                            module.config.call(userConfig, options, this.cwd);
                        }
                    } else {
                        warn('没有找到 ykit-config-' + this.extendConfig + ' 配置模块！');
                    }
                }
            }

            let configMethod = require(sysPath.join(this.cwd, this.configFile)),
                lintConfPath = lintConfigFile.getFilenameForDirectory(this.cwd),
                ignoreFile = sysPath.join(this.cwd, '.lintignore');

            if (lintConfPath && lintConfPath.indexOf('package.json') == -1) {
                extend(true, userConfig.lintConfig, lintConfigFile.load(lintConfPath));
            }

            if (fs.existsSync(ignoreFile)) {
                this.ignores.push(fs.readFileSync(ignoreFile, 'UTF-8'));
            }

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
                    np = entry[key] = entry[key] + '.js',
                    fp = sysPath.join(config.context, np);
                fs.writeFileSync(fp, 'require("./' + name + extName + '");', 'utf-8');
                fps.push(fp);
            }
        }
        config.plugins.push(new ExtractTextPlugin(config.output.filename.replace('[ext]', '.css')));

        return fps;
    }
    lint() {
        let prd = this.config.getConfig().output.path,
            cli = new CLIEngine(this.lintConfig),
            report = cli.executeOnFiles(globby.sync('src/**/*.js', {
                    cwd: this.cwd,
                    ignore: [prd]
                })
                .filter(ignore().add(this.ignores.join('\n')).createFilter())
                .map((file) => sysPath.join(this.cwd, file))),
            formatter = cli.getFormatter();
        info(formatter(report.results));
        return !report.results.length;
    }
    lintCss() {
        return globby.sync('src/**/*.css', {
                cwd: this.cwd,
                ignore: [this.config.getConfig().output.path]
            })
            .filter(
                ignore().add(this.ignores.join('\n')).createFilter()
            )
            .reduce((previousValue, filename) => {
                let code = fs.readFileSync(sysPath.join(this.cwd, filename), 'UTF-8'),
                    report = CSSLint.verify(code);
                if (report.messages.length) {
                    info(CSSLint.format(report, filename, 'stylish', {}));
                }
                return previousValue + report.messages.length;
            }, 0) == 0;
    }
    pack(opt, callback) {
        let config = this.config.getConfig();

        if (opt.lint) {
            let jsLint = this.lint(),
                cssLint = this.lintCss();
            if (!jsLint || !cssLint) {
                callback(true);
                return;
            }
        }

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

        let fps = this.fixCss();

        if (opt.sourcemap) {
            config.devtool = opt.sourcemap
        }

        try {
            childProcess.execSync('rm -rf ' + config.output.path);
        } catch (e) {}

        config.plugins.push(new ProgressBarPlugin())

        webpack(config, function(err, stats) {
            globby.sync('**/*.cache', {
                    cwd: config.output.path
                })
                .map((p) => sysPath.join(config.output.path, p))
                .concat(fps)
                .forEach((fp) => fs.unlinkSync(fp));
            callback(err, stats);
        });

        return this;
    }
    getCompiler() {
        let config = this.config.getConfig();
        config.output = config.output.dev;
        this.fixCss();
        return webpack(config);
    }
}

module.exports = Project;
