'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var webpack = require('webpack');
var colors = require('colors');

var UtilFs = require('../utils/fs.js');

exports.usage = '资源编译、打包';
exports.abbr = 'p';

exports.setOptions = function (optimist) {
    optimist.alias('l', 'lint');
    optimist.describe('l', '先进行验证');
    optimist.alias('m', 'min');
    optimist.describe('m', '压缩/混淆项目文件');
    optimist.alias('s', 'sourcemap');
    optimist.describe('s', '使用sourcemap');
    optimist.alias('c', 'clean');
    optimist.describe('c', '打包前清空输出目录');
    optimist.alias('q', 'quiet');
    optimist.describe('q', '静默模式');
};

exports.run = function (options) {
    var start = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var _this = this;

            var beforePackCallbackTasks, _loop, i, len, beforeTasks, _loop2;

            return _regenerator2.default.wrap(function _callee$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (process.env['SUDO_UID']) {
                                process.setuid(parseInt(process.env['SUDO_UID']));
                            }

                            if ((0, _keys2.default)(config.entry).length === 0) {
                                logWarn('Local config exports aseets not found.');
                                logDoc('http://ued.qunar.com/ykit/docs-%E9%85%8D%E7%BD%AE.html');
                                process.exit(1);
                            }

                            UtilFs.deleteFolderRecursive(this.cachePath);

                            beforePackCallbackTasks = this.beforePackCallback || [];
                            _loop = _regenerator2.default.mark(function _loop(i, len) {
                                return _regenerator2.default.wrap(function _loop$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                _context.next = 2;
                                                return new _promise2.default(function (resolve, reject) {
                                                    beforePackCallbackTasks[i](resolve, opt);
                                                });

                                            case 2:
                                            case 'end':
                                                return _context.stop();
                                        }
                                    }
                                }, _loop, _this);
                            });
                            i = 0, len = beforePackCallbackTasks.length;

                        case 6:
                            if (!(i < len)) {
                                _context3.next = 11;
                                break;
                            }

                            return _context3.delegateYield(_loop(i, len), 't0', 8);

                        case 8:
                            i++;
                            _context3.next = 6;
                            break;

                        case 11:
                            beforeTasks = this.hooks.beforePack;
                            _loop2 = _regenerator2.default.mark(function _loop2(i, len) {
                                return _regenerator2.default.wrap(function _loop2$(_context2) {
                                    while (1) {
                                        switch (_context2.prev = _context2.next) {
                                            case 0:
                                                _context2.next = 2;
                                                return new _promise2.default(function (resolve, reject) {
                                                    var isAsync = false;
                                                    beforeTasks[i].bind({
                                                        async: function async() {
                                                            isAsync = true;
                                                            return resolve;
                                                        }
                                                    })(opt);

                                                    if (!isAsync) {
                                                        resolve();
                                                    }
                                                });

                                            case 2:
                                            case 'end':
                                                return _context2.stop();
                                        }
                                    }
                                }, _loop2, _this);
                            });
                            i = 0, len = beforeTasks.length;

                        case 14:
                            if (!(i < len)) {
                                _context3.next = 19;
                                break;
                            }

                            return _context3.delegateYield(_loop2(i, len), 't1', 16);

                        case 16:
                            i++;
                            _context3.next = 14;
                            break;

                        case 19:
                            _context3.next = 21;
                            return compilingProcess.bind(this)();

                        case 21:
                            _context3.next = 23;
                            return handleAfterPack.bind(this)();

                        case 23:
                            _context3.next = 25;
                            return printStats.bind(this)();

                        case 25:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee, this);
        }));

        return function start() {
            return _ref.apply(this, arguments);
        };
    }();

    var min = options.m || options.min || false,
        lint = options.l || options.lint || false,
        clean = options.c || options.clean || true,
        quiet = options.q || options.quiet || false,
        sourcemap = options.s || options.sourcemap,
        packStartTime = Date.now(),
        opt = {
        lint: lint,
        min: min,
        sourcemap: sourcemap,
        clean: clean === 'false' ? false : true,
        quiet: quiet
    };

    var compilerStats = void 0,
        dist = void 0;
    var config = this.project.config.getConfig();

    start.bind(this.project)().catch(console.log.bind(console));

    ;

    function compilingProcess() {
        var _this2 = this;

        return new _promise2.default(function (resolve, reject) {
            if (opt.sourcemap) {
                config.devtool = opt.sourcemap;
            }

            if (!opt.quiet) {
                config.plugins.push(require('../plugins/progressBarPlugin.js'));
            }

            if (opt.min) {
                config.output = config.output.prd;
                config.devtool = '';
            } else {
                config.output = config.output.dev;
            }

            if (opt.clean) {
                try {
                    UtilFs.deleteFolderRecursive(config.output.path);
                } catch (e) {
                    error(e);
                }
            }

            _this2.fixCss();

            webpack(config, function (err, stats) {
                compilerStats = stats;
                dist = config.output.path;
                globby.sync('**/*.cache', { cwd: dist }).map(function (p) {
                    return sysPath.join(config.output.path, p);
                }).forEach(function (fp) {
                    fs.unlinkSync(fp);
                });

                if (err) {
                    spinner.text = '';
                    spinner.stop();
                    logError(err);
                    process.exit(1);
                }

                var statsInfo = stats.toJson({ errorDetails: false });
                if (statsInfo.warnings.length > 0) {
                    spinner.text = '';
                    spinner.stop();
                    logLinefeed();
                    statsInfo.warnings.map(function (warning) {
                        logWarn(warning + '\n');
                    });
                }

                if (statsInfo.errors.length > 0) {
                    spinner.text = '';
                    spinner.stop();
                    statsInfo.errors.map(function (err) {
                        logError(err + '\n');
                    });
                    process.exit(1);
                }

                if (opt.min) {
                    var computecluster = require('compute-cluster');
                    var cc = new computecluster({
                        module: sysPath.resolve(__dirname, '../modules/minWorker.js'),
                        max_backlog: -1,
                        max_processes: 5
                    });

                    spinner.start();

                    var assetsInfo = stats.toJson({
                        errorDetails: false
                    }).assets;
                    var processToRun = assetsInfo.length;

                    var originAssets = stats.compilation.assets;
                    var nextAssets = {};

                    assetsInfo.forEach(function (asset) {
                        cc.enqueue({
                            opt: opt,
                            cwd: dist,
                            buildOpts: _this2.build || _this2.config.build || {},
                            assetName: asset.name
                        }, function (err, response) {
                            if (response.error) {
                                // err log
                                var resErr = response.error;
                                spinner.text = '';
                                spinner.stop();
                                logError('Error occured while minifying ' + resErr.assetName + '\n' + resErr.errorSource);

                                process.exit(1);
                            }

                            // 将替换版本号的资源名取代原有名字
                            var replacedAssets = response.replacedAssets;
                            if (replacedAssets && replacedAssets.length > 0) {
                                var originAssetName = replacedAssets[0];
                                var nextAssetName = replacedAssets[1];
                                if (originAssets[originAssetName]) {
                                    nextAssets[nextAssetName] = originAssets[originAssetName];
                                }
                            }

                            processToRun -= 1;
                            spinner.text = '[Minify] ' + (assetsInfo.length - processToRun) + '/' + assetsInfo.length + ' assets';

                            if (processToRun === 0) {
                                cc.exit();
                                spinner.stop();

                                // 更新 stats
                                stats.compilation.assets = (0, _keys2.default)(nextAssets).length > 0 ? nextAssets : originAssets;
                                compilerStats = ststs;
                            }
                        });
                    });
                }

                resolve();
            });
        });
    }

    function handleAfterPack() {
        var _this3 = this;

        return new _promise2.default(function (resolve, reject) {
            spinner.stop();
            async.series(_this3.packCallbacks.concat(_this3.hooks.afterPack).map(function (packCallback) {
                return function (callback) {
                    var isAsync = false;

                    // 支持异步调用
                    packCallback.bind({
                        async: function async() {
                            isAsync = true;
                            return callback;
                        }
                    })(opt, compilerStats);

                    if (!isAsync) {
                        callback(null);
                    }
                };
            }), function (err) {
                if (err) {
                    logError(err);
                    process.exit(1);
                }
                resolve();
            });
        });
    }

    function printStats() {
        var _this4 = this;

        return new _promise2.default(function (resolve, reject) {
            process.stdout.write('\n---------------------  YKIT EMITTED ASSETS  ---------------------\n\n');

            var statsInfo = compilerStats.toJson({ errorDetails: false });
            var assetsInfo = _this4.config._config.assetsInfo || statsInfo.assets;
            assetsInfo.map(function (asset) {
                if (sysPath.extname(asset.name) !== '.cache') {
                    var fileSize = UtilFs.getFileSize(sysPath.resolve(dist, asset.name));
                    if (!fileSize) {
                        fileSize = asset.size > 1024 ? (asset.size / 1024).toFixed(2) + ' KB' : asset.size + ' Bytes';
                    }

                    if (!/\.cache$/.test(asset.name)) {
                        log('- '.gray + colors.bold(colors.green(asset.name)) + ' - ' + fileSize);
                    }
                }
            });

            var packDuration = Date.now() - packStartTime > 1000 ? Math.floor((Date.now() - packStartTime) / 1000) + 's' : Date.now() - packStartTime + 'ms';

            logInfo('Bundling Finishes in ' + packDuration + '.\n');

            resolve();
        });
    }
};