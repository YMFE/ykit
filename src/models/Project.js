'use strict';

let webpack = require('webpack');

let Config = require('./Config.js');

class Project {
    constructor(cwd) {
        this.cwd = cwd;
        this.config = new Config(cwd)
    }
    readConfig() {
            this.configFile = globby.sync('ykit.*.js')[0];
            if (!this.configFile) {
                error('没有找到 ykit 配置文件！');
                return false;
            }
            this.extendConfig = this.configFile.match(/ykit\.([\w\.]+)\.js/)[1].replace(/\./g, '-');
            if (this.extendConfig != 'config') {
                let modulePath = sysPath.join(this.cwd, 'node_modules', 'ykit-config-' + this.extendConfig),
                    extended = false;
                if (fs.existsSync(modulePath)) {
                    let module = require(modulePath);
                    if (module.config) {
                        extended = true;
                        module.config(this.config);
                    }
                } else {
                    try {
                        let module = require('ykit-config-' + this.extendConfig);
                        if (module.config) {
                            extended = true;
                            module.config(this.config);
                        }
                    } catch (e) {}
                }
                if (!extended) {
                    error('没有找到 ykit-config-' + this.extendConfig + ' 配置模块！');
                    return false;
                }
            }

            let configMethod = require(sysPath.join(this.cwd, this.configFile));

            if (!_.isFunction(configMethod)) {
                error(this.configFile + ' 没有 exports 正确的方法！');
                return false;
            }

            configMethod(this.config);

            return this;
        }
        pack(options, callback) {
            if (options.min) {
                this.config.addPlugins(new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    }
                }));
            }
            webpack(this.config.getConfig(), callback);

            return this;
        }
}

module.exports = Project;
