'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var webpack = require('webpack');
var requireg = require('requireg');

var path = require('path');
var fs = require('fs');

var Config = require('./Config.js'),
    Manager = require('../modules/manager.js'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

var UtilFs = require('../utils/fs.js');

var ENVS = {
    LOCAL: 'local',
    DEV: 'dev',
    PRD: 'prd'
};

var Project = function () {
    function Project(cwd) {
        _classCallCheck(this, Project);

        this.cwd = cwd;
        this.config = new Config(cwd);
        this.commands = Manager.getCommands();
        this.middlewares = [];
        this.packCallbacks = [];
        this.eslintConfig = require('../config/eslint.json');
        this.configFile = globby.sync(['ykit.*.js', 'ykit.js'], { cwd: this.cwd })[0] || '';
        this.extendConfig = this.configFile && this.configFile.match(/ykit\.([\w\.]+)\.js/) && this.configFile.match(/ykit\.([\w\.]+)\.js/)[1] && this.configFile.match(/ykit\.([\w\.]+)\.js/)[1].replace(/\./g, '-');
        this.ignores = ['node_modules/**/*', 'bower_components/**/*', 'dev/**/*', 'prd/**/*', '.ykit_cache/**/*'];
        this.cachePath = this._isCacheDirExists(cwd) || '';

        this.readConfig();
    }

    _createClass(Project, [{
        key: 'check',
        value: function check() {
            return !!this.configFile;
        }
    }, {
        key: 'setCommands',
        value: function setCommands(nextCommands) {
            if (Array.isArray(nextCommands)) {
                this.commands = this.commands.concat(nextCommands);
            }
        }
    }, {
        key: 'setEslintConfig',
        value: function setEslintConfig(projectEslintConfig) {
            extend(true, this.eslintConfig, projectEslintConfig);
        }
    }, {
        key: 'readConfig',
        value: function readConfig(options) {
            var _this = this;

            if (this.check()) {
                var userConfig = {
                    cwd: this.cwd,
                    _manager: Manager,
                    setConfig: this.config.setCompiler.bind(this.config), // 兼容旧api
                    setCompile: this.config.setCompiler.bind(this.config), // 兼容旧api
                    setCompiler: this.config.setCompiler.bind(this.config),
                    setExports: this.config.setExports.bind(this.config),
                    setGroupExports: this.config.setGroupExports.bind(this.config),
                    setSync: this.config.setSync.bind(this.config),
                    setCommands: this.setCommands.bind(this),
                    setEslintConfig: this.setEslintConfig.bind(this),
                    config: this.config.getConfig(),
                    commands: this.commands,
                    middlewares: this.middlewares,
                    applyBeforePack: this.config.applyBeforePack.bind(this.config),
                    packCallbacks: this.packCallbacks,
                    eslintConfig: this.eslintConfig,
                    applyMiddleware: this.config.applyMiddleware.bind(this.config),
                    env: this._getCurrentEnv() // 默认为本地环境,
                },
                    globalConfigs = Manager.readRC().configs || [];

                this.options = options = options || {};
                options.ExtractTextPlugin = ExtractTextPlugin;

                if (this.extendConfig != 'config') {
                    var _ret = function () {
                        var moduleName = 'ykit-config-' + _this.extendConfig,
                            modulePath = '';

                        var localSearchPath = sysPath.join(_this.cwd, 'node_modules/', moduleName);
                        var localSearchPathQnpm = sysPath.join(_this.cwd, 'node_modules/', '@qnpm/' + moduleName);

                        if (requireg.resolve(localSearchPath)) {
                            modulePath = localSearchPath;
                        } else if (requireg.resolve(moduleName)) {
                            modulePath = requireg.resolve(moduleName);
                        } else if (requireg.resolve(localSearchPathQnpm)) {
                            modulePath = localSearchPathQnpm;
                            moduleName = '@qnpm/' + moduleName;
                        } else if (requireg.resolve('@qnpm/' + moduleName)) {
                            modulePath = requireg.resolve('@qnpm/' + moduleName);
                            moduleName = '@qnpm/' + moduleName;
                        }

                        extend(true, userConfig.eslintConfig, Manager.loadEslintConfig(modulePath));
                        _this.ignores.push(Manager.loadIgnoreFile(modulePath));

                        if (fs.existsSync(modulePath)) {
                            var _module = require(modulePath);

                            if (_module && _module.config) {
                                _module.config.call(userConfig, options, _this.cwd);
                            }
                        } else {
                            var item = globalConfigs.filter(function (item) {
                                return item.name == moduleName;
                            })[0];
                            if (item) {
                                var _module2 = require(item.path);

                                extend(true, userConfig.eslintConfig, Manager.loadEslintConfig(item.path));
                                _this.ignores.push(Manager.loadIgnoreFile(item.path));

                                if (_module2 && _module2.config) {
                                    _module2.config.call(userConfig, options, _this.cwd);
                                }
                            } else if ((Manager.reloadRC().configs || []).some(function (item) {
                                return item.name == moduleName;
                            })) {
                                return {
                                    v: _this.readConfig(options)
                                };
                            } else {
                                if (_this.extendConfig) {
                                    warn('没有找到 ykit-config-' + _this.extendConfig + ' 配置模块！');
                                }
                            }
                        }
                    }();

                    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                }

                var configMethod = this._requireUncached(sysPath.join(this.cwd, this.configFile));
                extend(true, userConfig.eslintConfig, Manager.loadEslintConfig(this.cwd));
                this.ignores.push(Manager.loadIgnoreFile(this.cwd));

                if (configMethod) {
                    if (Array.isArray(configMethod)) {
                        this.config.setExports(configMethod);
                    }
                    if (typeof configMethod.config == 'function') {
                        var userConfigObj = configMethod.config.call(userConfig, options, this.cwd);

                        if (userConfigObj) {
                            if (Array.isArray(userConfigObj.export)) {
                                userConfigObj.export = userConfigObj.export.filter(function (item) {
                                    if ((typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object') {
                                        _this.config.setGroupExports(item.name, item.export);
                                        return false;
                                    } else {
                                        return true;
                                    }
                                });
                            }
                            this.config.setExports(userConfigObj.export);
                            this.config.setCompiler(userConfigObj.modifyWebpackConfig);
                            this.config.setSync(userConfigObj.sync);
                            this.setCommands(userConfigObj.command);
                        }
                    } else {
                        error(this.configFile + ' 没有 exports 正确的方法！');
                        return this;
                    }
                }

                var output = this.config.getConfig().output;
                for (var key in output) {
                    var op = output[key];
                    if (op.path && !sysPath.isAbsolute(op.path)) {
                        op.path = sysPath.join(this.cwd, op.path);
                    }
                }
            }
            return this;
        }
    }, {
        key: 'fixCss',
        value: function fixCss() {
            var _this2 = this;

            var config = this.config.getConfig(),
                entries = config.entry,
                cssExtNames = config.entryExtNames.css,
                fps = [];

            var contextPathRelativeToCwd = sysPath.relative(config.context, this.cwd) || '.';

            for (var key in entries) {
                var entryItem = entries[key],
                    entry = Array.isArray(entryItem) ? entryItem[entryItem.length - 1] : entryItem,
                    extName = sysPath.extname(entry);

                // 放在cache目录下
                var cachePath = this._isCacheDirExists(this.cwd);
                if (!cachePath) {
                    var newCachePath = sysPath.join(this.cwd, '.ykit_cache');

                    this.cachePath = newCachePath;
                    mkdirp.sync(newCachePath);
                }

                if (cssExtNames.indexOf(extName) > -1) {
                    (function () {
                        var requireFilePath = entries[key] = './' + sysPath.join(contextPathRelativeToCwd, '/.ykit_cache', entry + '.js'),
                            cacheFilePath = sysPath.join(config.context, requireFilePath);

                        mkdirp.sync(sysPath.dirname(cacheFilePath));

                        // 将原有entry的css路径写到js中
                        if (Array.isArray(entryItem)) {
                            // clear
                            fs.writeFileSync(cacheFilePath, '', 'utf-8');

                            entryItem.forEach(function (cssPath) {
                                var originCssPath = sysPath.join(config.context, cssPath);
                                var requiredPath = _this2._normalizePath(sysPath.relative(sysPath.dirname(cacheFilePath), originCssPath));
                                fs.appendFileSync(cacheFilePath, 'require("' + requiredPath + '");', 'utf-8');
                            });
                        } else {
                            var originCssPath = sysPath.join(config.context, entry);
                            var requiredPath = _this2._normalizePath(sysPath.relative(sysPath.dirname(cacheFilePath), originCssPath));
                            fs.writeFileSync(cacheFilePath, 'require("' + requiredPath + '");', 'utf-8');
                        }

                        fps.push(cacheFilePath);
                    })();
                }
            }
            config.plugins.push(new ExtractTextPlugin(config.output.filename.replace('[ext]', '.css')));
        }
    }, {
        key: 'lint',
        value: function lint(dir, callback) {
            var _this3 = this;

            warn('Linting JS Files ...');

            var CLIEngine = require('eslint').CLIEngine;

            // 如果有本地eslint优先使用本地eslint
            if (requireg.resolve(sysPath.join(this.cwd, 'node_modules/', 'eslint'))) {
                CLIEngine = requireg(sysPath.join(this.cwd, 'node_modules/', 'eslint')).CLIEngine;
            }

            var files = ['.js', '.yaml', '.yml', '.json', ''].map(function (ext) {
                return path.join(_this3.cwd, '.eslintrc' + ext);
            });
            var config = UtilFs.readFileAny(files);

            // 本地无 lint 配置，创建 .eslintrc.json
            if (!config) {
                var configPath = path.join(this.cwd, '.eslintrc.json');
                fs.writeFileSync(configPath, JSON.stringify(this.eslintConfig, null, 4));
            } else {
                this.eslintConfig = config;
            }

            var cli = new CLIEngine(this.eslintConfig),
                report = cli.executeOnFiles(this._getLintFiles(dir, 'js')),
                formatter = cli.getFormatter();

            if (report.errorCount > 0) {
                info(formatter(report.results));
            }

            callback(null, !report.errorCount);
        }
    }, {
        key: 'pack',
        value: function pack(opt, callback) {
            var _this4 = this;

            var config = this.config.getConfig();
            UtilFs.deleteFolderRecursive(this.cachePath);

            if (!config.beforePack) {
                config.beforePack = function (done) {
                    done();
                };
            }

            var compilerProcess = function compilerProcess() {
                if (opt.sourcemap) {
                    config.devtool = opt.sourcemap;
                }

                if (!opt.quiet) {
                    config.plugins.push(require('../plugins/progressBarPlugin.js'));
                }

                if (opt.min) {
                    // variable name mangling
                    var mangle = true;
                    if (typeof opt.min === 'string' && opt.min.split('=')[0] === 'mangle' && opt.min.split('=')[1] === 'false') {
                        mangle = false;
                    }

                    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
                        compress: {
                            warnings: false
                        },
                        mangle: mangle
                    }));
                    config.output = config.output.prd;
                    config.devtool = '';
                } else {
                    config.output = config.output.dev;
                }

                _this4.fixCss();

                if (opt.clean) {
                    try {
                        UtilFs.deleteFolderRecursive(config.output.path);
                    } catch (e) {
                        error(e);
                    }
                }

                webpack(config, function (err, stats) {
                    globby.sync('**/*.cache', {
                        cwd: config.output.path
                    }).map(function (p) {
                        return sysPath.join(config.output.path, p);
                    }).forEach(function (fp) {
                        return fs.unlinkSync(fp);
                    });

                    if (!err) {
                        var statsInfo = stats.toJson({
                            errorDetails: false
                        });

                        process.stdout.write(
                        // clear bundle log
                        '                                                                           \n' + '\x1b[90m' + '--------------------------  YKIT PACKED ASSETS  -------------------------- ' + '\x1b[0m \n\n');

                        if (statsInfo.errors.length > 0) {
                            statsInfo.errors.map(function (err) {
                                error(err.red);
                                info();
                            });
                        }
                        if (statsInfo.warnings.length > 0) {
                            statsInfo.warnings.map(function (warning) {
                                warn(warning.yellow);
                                info();
                            });
                        }
                        statsInfo.assets.map(function (asset) {
                            var size = asset.size > 1024 ? (asset.size / 1024).toFixed(2) + ' kB' : asset.size + ' bytes';
                            if (!/\.cache$/.test(asset.name)) {
                                log('- '.gray + asset.name + ' - ' + size);
                            }
                        });
                        info();
                        _this4.packCallbacks.forEach(function (cb) {
                            return cb(opt, stats);
                        });
                    }

                    callback(err, stats);
                });
            };

            config.beforePack(function () {
                if (opt.lint) {
                    async.series([function (callback) {
                        return _this4.lint(callback);
                    }], function (err, results) {
                        if (!err) {
                            if (results[0] && results[1]) {
                                compilerProcess();
                            }
                        } else {
                            error(err.stack);
                        }
                    });
                } else {
                    compilerProcess();
                }
            });

            return this;
        }
    }, {
        key: 'getServerCompiler',
        value: function getServerCompiler(handler) {
            var config = this.config.getConfig();
            config.output = extend(true, {
                path: config.output.prd.path,
                filename: '[name][ext]'
            }, config.output.local || {});

            this.fixCss();

            if (handler && typeof handler === 'function') {
                config = handler(config);
            }

            return webpack(config);
        }
    }, {
        key: '_getLintFiles',
        value: function _getLintFiles(dir, fileType) {
            var context = this.config._config.context,
                extNames = this.config._config.entryExtNames[fileType],
                lintPath = extNames.map(function (ext) {
                return sysPath.join('./**/*' + ext);
            });

            if (dir) {
                dir = sysPath.resolve(this.cwd, dir);
                try {
                    fs.statSync(dir).isDirectory() ? context = dir : lintPath = sysPath.relative(context, dir);
                } catch (e) {
                    error(e);
                    process.exit(1);
                }
            }

            return globby.sync(lintPath, {
                cwd: context,
                root: context,
                ignore: this.ignores
            }).map(function (lintPathItem) {
                return sysPath.resolve(context, lintPathItem);
            });
        }
    }, {
        key: '_normalizePath',
        value: function _normalizePath(str, stripTrailing) {
            if (typeof str !== 'string') {
                throw new TypeError('expected a string');
            }
            str = str.replace(/[\\\/]+/g, '/');
            if (stripTrailing !== false) {
                str = str.replace(/\/$/, '');
            }
            return str;
        }
    }, {
        key: '_requireUncached',
        value: function _requireUncached(module) {
            delete require.cache[require.resolve(module)];
            return require(module);
        }
    }, {
        key: '_isCacheDirExists',
        value: function _isCacheDirExists(cwd) {
            var isCacheExists = void 0;

            try {
                fs.statSync(sysPath.join(cwd, '.ykit_cache'));
                return sysPath.join(cwd, '.ykit_cache');
            } catch (e) {
                // do nothing
            }

            try {
                fs.statSync(sysPath.join(cwd, '.cache'));
                return sysPath.join(cwd, '.cache');
            } catch (e) {
                isCacheExists == false;
            }

            return false;
        }
    }, {
        key: '_fileExists',
        value: function _fileExists(filePath) {
            try {
                return fs.statSync(filePath).isFile();
            } catch (err) {
                return false;
            }
        }
    }, {
        key: '_getCurrentEnv',
        value: function _getCurrentEnv() {
            if (process.argv[2] === 'pack') {
                if (process.argv.indexOf('-m') > -1) {
                    return ENVS.PRD;
                } else {
                    return ENVS.DEV;
                }
            }

            return ENVS.LOCAL;
        }
    }]);

    return Project;
}();

module.exports = Project;