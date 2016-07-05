'use strict';

let webpack = require('webpack');

let Config = require('./Config.js'),
    ExtractTextPlugin = require("extract-text-webpack-plugin");

class Project {
    constructor(cwd) {
        this.cwd = cwd;
        this.config = new Config(cwd);
        this.extraCommands = [];
        this.middlewares = [];
    }
    readConfig(options) {
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
            let modulePath = sysPath.join(this.cwd, 'node_modules', 'ykit-config-' + this.extendConfig),
                extended = false;
            if (fs.existsSync(modulePath)) {
                let module = require(modulePath);
                if (module.config) {
                    extended = true;
                    module.config(this.config, options, this.cwd);
                    this.extraCommands = this.extraCommands.concat(module.commands || []);
                    if (module.middlewares) {
                        this.middlewares = module.middlewares;
                    }
                }
            } else {
                try {
                    let module = require('ykit-config-' + this.extendConfig);
                    if (module.config) {
                        extended = true;
                        module.config(this.config, options, this.cwd);
                        this.extraCommands = this.extraCommands.concat(module.commands || []);
                        if (module.middlewares) {
                            this.middlewares = module.middlewares;
                        }
                    }
                } catch (e) {}
            }
            if (!extended) {
                error('没有找到 ykit-config-' + this.extendConfig + ' 配置模块！');
                return this;
            }
        }

        let configMethod = require(sysPath.join(this.cwd, this.configFile));

        if (_.isArray(configMethod)) {
            this.config.setExports(configMethod);
        } else if (_.isFunction(configMethod.config)) {
            configMethod.config(this.config, options, this.cwd);
        } else {
            error(this.configFile + ' 没有 exports 正确的方法！');
            return this;
        }
        this.extraCommands = this.extraCommands.concat(configMethod.commands || []);
        if (configMethod.middlewares) {
            this.middlewares = configMethod.middlewares;
        }

        if (this.config._config.output.path[0] != '/') {
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
            fps = [];

        for (let key in entry) {
            let extName = sysPath.extname(entry[key]);
            if (config.cssExtNames.indexOf(extName) > -1) {
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
    pack(callback) {
        let config = this.config.getConfig(),
            fps = this.fixCss();

        if (this.options.min) {
            config.plugins.push(new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            }));
        }

        try {
            childProcess.execSync('rm -rf ' + config.output.path);
        } catch(e){}
        
        webpack(config, function() {
            globby.sync('**/*.cache', {
                cwd: config.output.path
            })
            .map((p) => sysPath.join(config.output.path, p))
            .concat(fps)
            .forEach((fp) => fs.unlinkSync(fp));
            callback();
        });

        return this;
    }
    getCompiler() {
        this.fixCss();
        return webpack(this.config.getConfig());
    }
}

module.exports = Project;
