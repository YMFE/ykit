'use strict';

let webpack = require('webpack'),
    ignore = require('ignore'),
    CLIEngine = require('eslint').CLIEngine,
    eslintConfigFile = require("eslint/lib/config/config-file.js");

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
        this.eslintConfig = {};
        this.configFile = globby.sync('ykit.*.js', {
            cwd: this.cwd
        })[0] || '';
        this.extendConfig = this.configFile && this.configFile.match(/ykit\.([\w\.]+)\.js/)[1].replace(/\./g, '-');
        this.ignores = [];
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
                    eslintConfig: this.eslintConfig
                },
                globalConfigs = Manager.readRC().configs || [];

            this.options = options = options || {};
            options.ExtractTextPlugin = ExtractTextPlugin;

            if (this.extendConfig != 'config') {
                let moduleName = 'ykit-config-' + this.extendConfig,
                    modulePath = sysPath.join(this.cwd, 'node_modules', moduleName),
                    eslintConfPath = eslintConfigFile.getFilenameForDirectory(modulePath),
                    ignoreFile = sysPath.join(modulePath, '.lintignore');

                if (eslintConfPath && eslintConfPath.indexOf('package.json') == -1) {
                    extend(true, userConfig.eslintConfig, eslintConfigFile.load(eslintConfPath));
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
                            eslintConfPath = eslintConfigFile.getFilenameForDirectory(item.path),
                            ignoreFile = sysPath.join(modulePath, '.lintignore');

                        if (eslintConfPath && eslintConfPath.indexOf('package.json') == -1) {
                            extend(true, userConfig.eslintConfig, eslintConfigFile.load(eslintConfPath));
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
                eslintFile = eslintConfigFile.getFilenameForDirectory(this.cwd),
                ignoreFile = sysPath.join(this.cwd, '.lintignore');

            if (eslintFile && eslintFile.indexOf('package.json') == -1) {
                extend(true, userConfig.eslintConfig, eslintConfigFile.load(eslintFile));
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

            if (!sysPath.isAbsolute(this.config.getConfig().output.path[0])) {
                this.config.setOutput({
                    path: sysPath.join(this.cwd, this.config.getConfig().output.path)
                });
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
            cli = new CLIEngine(this.eslintConfig),
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
    pack(opt, callback) {
        let config = this.config.getConfig(),
            fps = this.fixCss();

        if (opt.lint && !this.lint()) {
            callback(true);
            return;
        }

        if (opt.min) {
            config.plugins.push(new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            }));
        }

        if(opt.sourcemap){
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
        this.fixCss();
        return webpack(this.config.getConfig());
    }
}

module.exports = Project;
