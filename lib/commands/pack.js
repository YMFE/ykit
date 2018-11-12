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
    optimist.alias('p', 'process');
    optimist.describe('p', '进程池大小');
    optimist.alias('x', 'custom-webpack-plugin');
    optimist.describe('x', '取消默认的压缩, 使用自定义webpack-plugin代替');
};

exports.run = function (options) {
    var start = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            // http://man7.org/linux/man-pages/man2/setuid.2.html
                            // 以sudo身份执行的时候，会自动设置此环境变量
                            if (process.env['SUDO_UID']) {
                                try {
                                    process.setuid(parseInt(process.env['SUDO_UID']));
                                } catch (e) {
                                    // 这里catch error,处理系统不支持意外，以后权限的问题
                                    logWarn('\u8BBE\u7F6Euid\u4E3A' + process.env['SUDO_UID'] + '\u53D1\u751F\u4E86\u95EE\u9898\u3002\u5982\u679C\u4E0D\u5F71\u54CD\u6700\u7EC8\u7684pack\u7ED3\u679C\uFF0C\u8BF7\u5FFD\u7565\u3002');
                                    logWarn(e);
                                }
                            }

                            if ((0, _keys2.default)(config.entry).length === 0) {
                                logError('No assets entry found.');
                                logDoc('https://ykit.ymfe.org/guide/basic-config.html');
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

    var min = options.m || options.min || false,
        lint = options.l || options.lint || false,
        clean = options.c || options.clean || true,
        quiet = options.q || options.quiet || false,
        cusMin = options.x || options['custom-webpack-plugin'] || false,
        sourcemap = options.s || options.sourcemap,
        processNum = options.p || options.process || 4,
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

    // eslint-disable-next-line
    start.bind(this.project)().catch(console.log.bind(console));

    function handlebeforeCompiling() {
        var _this = this;

        return new _promise2.default(function (resolve, reject) {
            async.series(_this.hooks.beforeCompiling.map(function (beforeTask) {
                return function (callback) {
                    var isAsync = false;
                    beforeTask.bind({
                        async: function async() {
                            isAsync = true;
                            return callback;
                        }
                    })(opt, config);

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

    function handleBeforePack() {
        var _this2 = this;

        return new _promise2.default(function (resolve, reject) {
            async.series(_this2.beforePackCallbacks.map(function (beforePackItem) {
                return function (callback) {
                    // 支持旧的 beforePackCallbacks 形式
                    beforePackItem(callback, opt);
                };
            }).concat(_this2.hooks.beforePack.map(function (beforeTask) {
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
        // if (opt.sourcemap) {
        //     config.devtool = opt.sourcemap;
        // }

        if (!opt.quiet) {
            config.plugins.push(require('../plugins/progressBarPlugin.js'));
        }

        if (opt.min) {
            config.output = config.output.prd;
            // fix min source-map config
            if (opt.sourcemap) {
                // min 模式下指定 sourcemap 的生成方式为完整的 sourcemap
                config.devtool = 'source-map';
            }
        } else {
            config.devtool = config.devtool || 'source-map';
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

        this.moveSourcemap();

        return config;
    }

    function compilingProcess() {
        var _this3 = this;

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

                if (opt.min && !cusMin) {
                    var computecluster = require('compute-cluster');
                    var cc = new computecluster({
                        module: sysPath.resolve(__dirname, '../modules/minWorker.js'),
                        max_backlog: -1,
                        max_processes: processNum
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
                            buildOpts: _this3.build || _this3.config.build || {},
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
                                compilerStats = stats;
                                resolve();
                            }
                        });
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    function handleAfterPack() {
        var _this4 = this;

        return new _promise2.default(function (resolve, reject) {
            spinner.stop();
            async.series(_this4.packCallbacks.concat(_this4.hooks.afterPack).map(function (packCallback) {
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
        var _this5 = this;

        return new _promise2.default(function (resolve, reject) {
            process.stdout.write('\n---------------------  YKIT EMITTED ASSETS  ---------------------\n\n');

            var statsInfo = compilerStats.toJson({ errorDetails: false });
            var assetsInfo = _this5.config._config.assetsInfo || statsInfo.assets;
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