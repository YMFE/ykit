'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var webpack = require('webpack');
var requireg = require('requireg');

var Config = require('./Config.js'),
    Manager = require('../modules/manager.js'),
    ExtractTextPlugin = require("extract-text-webpack-plugin");

var UtilFs = require('../utils/fs.js');

var Project = function () {
    function Project(cwd) {
        _classCallCheck(this, Project);

        this.cwd = cwd;
        this.config = new Config(cwd);
        this.commands = Manager.getCommands();
        this.middlewares = [];
        this.packCallbacks = [];
        this.eslintConfig = require('../config/eslint.json');
        this.stylelintConfig = require('../config/stylelint.json');
        this.configFile = globby.sync(['ykit.*.js', 'ykit.js'], {
            cwd: this.cwd
        })[0] || '';
        this.extendConfig = this.configFile && this.configFile.match(/ykit\.([\w\.]+)\.js/) && this.configFile.match(/ykit\.([\w\.]+)\.js/)[1] && this.configFile.match(/ykit\.([\w\.]+)\.js/)[1].replace(/\./g, '-');
        this.ignores = ["node_modules/**/*", "bower_components/**/*", "dev/**/*", "prd/**/*"];
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
                        extend(true, userConfig.stylelintConfig, Manager.loadStylelintConfig(modulePath));
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
                                extend(true, userConfig.stylelintConfig, Manager.loadStylelintConfig(item.path));
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

                var output = this.config.getConfig().output;
                for (var key in output) {
                    var op = output[key];
                    if (!sysPath.isAbsolute(op.path)) {
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

                            entryItem.forEach(function (cssPath, i) {
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
            var CLIEngine = require('eslint').CLIEngine;

            warn('Linting JS Files ...');
            this.eslintConfig.useEslintrc = false;

            extend(true, this.eslintConfig, this.config._config.eslintConfig);

            var cliengine = this.eslintConfig.linter || CLIEngine,
                // 优先使用项目配置的linter
            cli = new cliengine(this.eslintConfig),
                report = cli.executeOnFiles(this._getLintFiles(dir, 'js')),
                formatter = cli.getFormatter();

            if (report.errorCount > 0) {
                info(formatter(report.results));
            }

            callback(null, !report.errorCount);
        }
    }, {
        key: 'lintCss',
        value: function lintCss(dir, callback) {
            var stylelint = require('stylelint');

            warn('Linting CSS Files ...');

            var config = {
                config: this.stylelintConfig,
                files: this._getLintFiles(dir, 'css'),
                syntax: 'scss',
                formatter: 'verbose'
            };

            if (config.files.length) {
                stylelint.lint(config).then(function (data) {
                    if (data.errored) {
                        console.log(data.output);
                    }
                    callback(null, !data.errored);
                }).catch(function () {
                    callback(true);
                });
            } else {
                callback(null, true);
            }
        }
    }, {
        key: 'pack',
        value: function pack(opt, callback) {
            var _this3 = this;

            var config = this.config.getConfig();
            UtilFs.deleteFolderRecursive(this.cachePath);

            var process = function process() {

                if (opt.sourcemap) {
                    config.devtool = opt.sourcemap;
                }

                if (opt.min) {
                    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
                        compress: {
                            warnings: false
                        }
                    }));
                    config.output = config.output.prd;
                    config.devtool = '';
                } else {
                    config.output = config.output.dev;
                }

                _this3.fixCss();

                if (opt.clean) {
                    try {
                        childProcess.execSync('rm -rf ' + config.output.path);
                    } catch (e) {}
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

                        if (statsInfo.errors.length > 0) {
                            statsInfo.errors.map(function (err) {
                                error(err.red);
                                info();
                            });
                        }
                        if (statsInfo.warnings.length > 0) {
                            statsInfo.warnings.map(function (warning) {
                                warn(err.yellow);
                                info();
                            });
                        }
                        statsInfo.assets.map(function (asset) {
                            var size = asset.size > 1024 ? (asset.size / 1024).toFixed(2) + ' kB' : asset.size + ' bytes';
                            if (!/\.cache$/.test(asset.name)) {
                                log('packed asset: '.gray + asset.name + ' - ' + size);
                            }
                        });
                        info();
                        _this3.packCallbacks.forEach(function (cb) {
                            return cb(opt, stats);
                        });
                    }

                    callback(err, stats);
                });
            };

            if (opt.lint) {
                async.series([function (callback) {
                    return _this3.lint(callback);
                }, function (callback) {
                    return _this3.lintCss(callback);
                }], function (err, results) {
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
    }, {
        key: 'getServerCompiler',
        value: function getServerCompiler(handler) {
            var config = this.config.getConfig();
            config.output = {
                path: '/cache',
                filename: '[name][ext]'
            };
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
            var isCacheExists = void 0,
                isYkitCacheExists = void 0;

            try {
                fs.statSync(sysPath.join(cwd, '.ykit_cache'));
                return sysPath.join(cwd, '.ykit_cache');
            } catch (e) {
                isYkitCacheExists = false;
            }

            try {
                fs.statSync(sysPath.join(cwd, '.cache'));
                return sysPath.join(cwd, '.cache');
            } catch (e) {
                isCacheExists == false;
            }

            return false;
        }
    }]);

    return Project;
}();

module.exports = Project;