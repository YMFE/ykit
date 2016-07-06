'use strict';

let webpack = require('webpack'),
    CLIEngine = require('eslint').CLIEngine,
    eslintConfigFile = require("eslint/lib/config/config-file.js")

let Config = require('./Config.js'),
    ExtractTextPlugin = require("extract-text-webpack-plugin");

class Project {
    constructor(cwd) {
        this.cwd = cwd;
        this.config = new Config(cwd);
        this.extraCommands = [];
        this.middlewares = [];
        this.eslintConfig = {};
    }
    readConfig(options) {
        let userConfig = {
            config: this.config.getConfig(),
            commands: this.extraCommands,
            middlewares: this.middlewares,
            eslintConfig: this.eslintConfig
        };
        this.options = options = options || {};
        options.ExtractTextPlugin = ExtractTextPlugin;
        this.configFile = globby.sync('ykit.*.js', {
            cwd: this.cwd
        })[0];
        if (!this.configFile) {
            if (!options.noCheck) {
                error('没有找到 ykit 配置文件！');
            }
            return this;
        }
        this.extendConfig = this.configFile.match(/ykit\.([\w\.]+)\.js/)[1].replace(/\./g, '-');
        if (this.extendConfig != 'config') {
            let modulePath = sysPath.join(this.cwd, 'node_modules', 'ykit-config-' + this.extendConfig, 'ykit.config.js'),
                eslintConfPath = eslintConfigFile.getFilenameForDirectory(sysPath.join(this.cwd, 'node_modules', 'ykit-config-' + this.extendConfig));
            if (eslintConfPath && eslintConfPath.indexOf('package.json') == -1) {
                extend(true, userConfig.eslintConfig, eslintConfigFile.load(eslintConfPath));
            }
            if (fs.existsSync(modulePath)) {
                let module = require(modulePath);
                if (module && module.config) {
                    module.config.call(userConfig, options, this.cwd);
                }
            } else {
                warn('没有找到 ykit-config-' + this.extendConfig + ' 配置模块！');
            }

        }

        let configMethod = require(sysPath.join(this.cwd, this.configFile)),
            eslintFile = eslintConfigFile.getFilenameForDirectory(this.cwd);

        if (eslintFile && eslintFile.indexOf('package.json') == -1) {
            extend(true, userConfig.eslintConfig, eslintConfigFile.load(eslintFile));
        }

        if (Array.isArray(configMethod)) {
            this.config.setExports(configMethod);
        } else if (typeof configMethod.config == 'function') {
            configMethod.config.call(userConfig, options, this.cwd);
        } else {
            error(this.configFile + ' 没有 exports 正确的方法！');
            return this;
        }

        if (!sysPath.isAbsolute(this.config.getConfig().output.path[0])) {
            this.config.setOutput({
                path: sysPath.join(this.cwd, this.config._config.output.path)
            });
        }

        return this;
    }
    check() {
        return !!this.configFile;
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
        let cli = new CLIEngine(this.eslintConfig),
            report = cli.executeOnFiles([this.cwd]),
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

        if (this.options.min) {
            config.plugins.push(new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            }));
        }

        try {
            childProcess.execSync('rm -rf ' + config.output.path);
        } catch (e) {}

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
