'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var webpack = require('webpack');
var colors = require('colors');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var UtilFs = require('../utils/fs.js');
var ConfigProcessCircle = require('../modules/ConfigProcessCircle.js');

exports.usage = '资源编译、打包';
exports.abbr = 'p';

exports.setOptions = function (optimist) {
    optimist.alias('m', 'min');
    optimist.describe('m', '压缩/混淆项目文件');
    optimist.alias('s', 'sourcemap');
    optimist.describe('s', '使用sourcemap');
    optimist.alias('c', 'clean');
    optimist.describe('c', '打包前清空输出目录');
    optimist.alias('q', 'quiet');
    optimist.describe('q', '静默模式');
    optimist.alias('p', 'process');
    optimist.describe('p', '进程池大小');
};

exports.run = function (options) {
    var start = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (process.env['SUDO_UID']) {
                                process.setuid(parseInt(process.env['SUDO_UID']));
                            }

                            if ((0, _keys2.default)(config.entry).length === 0) {
                                logError('No assets entry found.');
                                logDoc('http://ued.qunar.com/ykit/docs-%E9%85%8D%E7%BD%AE.html');
                                process.exit(1);
                            }

                            UtilFs.deleteFolderRecursive(this.cachePath);

                            _context.next = 5;
                            return handleBeforePack.bind(this)();

                        case 5:
                            _context.next = 7;
                            return prepareConfig.bind(this)();

                        case 7:
                            _context.next = 9;
                            return handlebeforeCompiling.bind(this)();

                        case 9:
                            _context.next = 11;
                            return compilingProcess.bind(this)();

                        case 11:
                            _context.next = 13;
                            return handleAfterPack.bind(this)();

                        case 13:
                            _context.next = 15;
                            return printStats.bind(this)();

                        case 15:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        return function start() {
            return _ref.apply(this, arguments);
        };
    }();

    var handlebeforeCompiling = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return ConfigProcessCircle.runTasksBeforeCompiling(this.hooks, config);

                        case 2:
                            config = _context2.sent;

                        case 3:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        return function handlebeforeCompiling() {
            return _ref2.apply(this, arguments);
        };
    }();

    log('ykit@' + require('../../package.json').version);

    var min = options.m || options.min || false,
        clean = options.c || options.clean || true,
        quiet = options.q || options.quiet || false,
        sourcemap = options.s || options.sourcemap,
        processNum = options.p || options.process || 4,
        packStartTime = Date.now(),
        opt = {
        min: min,
        sourcemap: sourcemap,
        clean: clean === 'false' ? false : true,
        quiet: quiet
    };

    var compilerStats = void 0,
        dist = void 0;
    var config = this.project.config.getConfig();

    // eslint-disable-next-line
    start.bind(this.project)().catch(console.log.bind(console));

    function handleBeforePack() {
        var _this = this;

        return new _promise2.default(function (resolve, reject) {
            async.series(_this.beforePackCallbacks.map(function (beforePackItem) {
                return function (callback) {
                    // 支持旧的 beforePackCallbacks 形式
                    beforePackItem(callback, opt);
                };
            }).concat(_this.hooks.beforePack.map(function (beforeTask) {
                return function (callback) {
                    var isAsync = false;
                    beforeTask.bind({
                        async: function async() {
                            isAsync = true;
                            return callback;
                        }
                    })(opt);

                    if (!isAsync) {
                        callback(null);
                    }
                };
            })), function (err) {
                if (err) {
                    logError(err);
                    process.exit(1);
                }
                resolve();
            });
        });
    }

    function prepareConfig() {
        config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());

        if (!opt.quiet) {
            config.plugins.push(require('../plugins/progressBarPlugin.js'));
        }

        if (opt.min) {
            config.output = config.output.prd;
            config.plugins.push(new UglifyJsPlugin({
                sourceMap: false,
                parallel: true,
                uglifyOptions: {
                    ie8: true
                }
            }));
        } else {
            config.devtool = 'source-map';
            config.output = config.output.dev;
        }

        if (opt.clean) {
            try {
                UtilFs.deleteFolderRecursive(config.output.path);
            } catch (e) {
                error(e);
            }
        }

        this.fixCss();

        return config;
    }

    function compilingProcess() {
        return new _promise2.default(function (resolve, reject) {
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

                resolve();
            });
        });
    }

    function handleAfterPack() {
        var _this2 = this;

        return new _promise2.default(function (resolve, reject) {
            spinner.stop();
            async.series(_this2.packCallbacks.concat(_this2.hooks.afterPack).map(function (packCallback) {
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
        var _this3 = this;

        return new _promise2.default(function (resolve, reject) {
            process.stdout.write('\n---------------------  YKIT EMITTED ASSETS  ---------------------\n\n');

            var statsInfo = compilerStats.toJson({ errorDetails: false });
            var assetsInfo = _this3.config._config.assetsInfo || statsInfo.assets;
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