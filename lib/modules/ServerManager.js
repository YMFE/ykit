'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var ConfigProcessCircle = require('./ConfigProcessCircle');
var ConfigConverter = require('./ConfigConverter.js');
var UtilFs = require('../utils/fs');
var UtilPath = require('../utils/path');

var usingHotServer = null;

module.exports = {
    removeCacheDir: function removeCacheDir(middlewareCache, projectName, projectDir) {
        var isFirstCompileDir = true;
        (0, _keys2.default)(middlewareCache).map(function (cacheName) {
            if (cacheName.startsWith(projectName)) {
                isFirstCompileDir = false;
            }
        });
        if (isFirstCompileDir) {
            UtilFs.deleteFolderRecursive(sysPath.join(projectDir, YKIT_CACHE_DIR), true);
        }
    },
    setHotServer: function setHotServer(webpackConfig, projectDir, projectName, port) {
        // 修改 publicPath 为当前服务
        var localPublicPath = webpackConfig.output.local.publicPath;
        var hostReg = /(http:|https:)?(\/\/)([^\/]+)/i;

        if (localPublicPath && localPublicPath.match(hostReg).length === 4) {
            localPublicPath = '/' + UtilPath.normalize(localPublicPath, false);
            localPublicPath = localPublicPath.replace(hostReg, function (matches, httpStr, splitStr, host) {
                httpStr = httpStr || '';
                return httpStr + '//' + '127.0.0.1:' + port;
            });
            webpackConfig.output.local.publicPath = localPublicPath;
        } else {
            // hot 且 未指定 publicPath 需要手动设置方式 hot.json 404
            var relativePath = sysPath.relative(projectDir, webpackConfig.output.local.path);
            webpackConfig.output.local.publicPath = 'http://127.0.0.1:' + port + '/' + projectName + '/' + relativePath + '/';
        }

        webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

        if (!usingHotServer) {
            usingHotServer = projectName;
            if ((0, _typeof3.default)(webpackConfig.entry) === 'object') {
                (0, _keys2.default)(webpackConfig.entry).map(function (key) {
                    var entryItem = webpackConfig.entry[key];
                    if (sysPath.extname(entryItem[entryItem.length - 1]) === '.js') {
                        var whmPath = require.resolve('webpack-hot-middleware/client');
                        var hotPath = 'http://127.0.0.1:' + port + '/__webpack_hmr';
                        entryItem.unshift(whmPath + '?reload=true&path=' + hotPath + '&timeout=9999999&overlay=false');
                    }
                    return entryItem;
                });
            }
        }
    },
    getCompiler: function getCompiler(shouldCompileAllEntries, reqUrl, callback) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var webpackConfig, entries, isExtractTextPluginExists, compiler;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            webpackConfig = extend(true, {}, _this.config._config);
                            entries = extend(true, {}, webpackConfig.entry);


                            webpackConfig.output = extend(true, {
                                path: webpackConfig.output.prd.path,
                                filename: '[name][ext]'
                            }, webpackConfig.output.local || {});

                            if (!shouldCompileAllEntries) {
                                // entry 应该是个空对象, 这样如果没有找到请求对应的 entry, 就不会编译全部入口
                                webpackConfig.entry = {};

                                // 将 webpack entry 设置为当前请求的资源
                                (0, _keys2.default)(entries).map(function (entryKey) {
                                    var entryItem = entries[entryKey];

                                    var entryPath = '';

                                    if (Array.isArray(entryItem)) {
                                        entryPath = entryItem[entryItem.length - 1];
                                    } else {
                                        entryPath = entryItem;
                                    }

                                    // 应用后缀转换规则
                                    var entryExtNames = webpackConfig.entryExtNames;
                                    (0, _keys2.default)(entryExtNames).map(function (targetExtName) {
                                        var exts = entryExtNames[targetExtName];

                                        // 如果是 css 要考虑 css.js 的情况
                                        if (targetExtName === 'css') {
                                            exts = exts.concat(entryExtNames[targetExtName].map(function (name) {
                                                return name + '.js';
                                            }));
                                        }

                                        exts = exts.map(function (name) {
                                            return name + '$';
                                        });
                                        var replaceReg = new RegExp('\\' + exts.join('|\\'));
                                        entryPath = UtilPath.normalize(entryPath.replace(replaceReg, '.' + targetExtName));
                                    });

                                    // 如果是 ykit 处理过的样式文件，将其变为正常的请求路径(../.ykit_cache/main/index.css => main/index.css)
                                    if (entryPath.indexOf('.css.js') && entryPath.indexOf('.ykit_cache/') > 1) {
                                        entryPath = entryPath.split('.ykit_cache/')[1];
                                    }

                                    // 判断所请求的资源是否在入口配置中
                                    var matchingPath = sysPath.normalize(entryPath) === sysPath.normalize(reqUrl);
                                    var matchingKey = sysPath.normalize(reqUrl) === entryKey + sysPath.extname(reqUrl);

                                    if (matchingPath || matchingKey) {
                                        webpackConfig.entry = (0, _defineProperty3.default)({}, entryKey, entryItem);
                                    }
                                });
                            }

                            // TODO fixcss?

                            // 添加 server 所需 plugins
                            webpackConfig.plugins.push(require('../plugins/progressBarPlugin.js'));
                            webpackConfig.plugins.push(require('../plugins/compileInfoPlugin.js'));
                            isExtractTextPluginExists = webpackConfig.plugins.some(function (plugin) {
                                return plugin instanceof ExtractTextPlugin;
                            });

                            if (!isExtractTextPluginExists) {
                                webpackConfig.plugins.push(new ExtractTextPlugin(webpackConfig.output.filename.replace('[ext]', '.css')));
                            }

                            // 执行 beforeCompiling
                            webpackConfig = ConfigConverter(webpackConfig);
                            _context.next = 11;
                            return ConfigProcessCircle.runTasksBeforeCompiling(_this.hooks, webpackConfig);

                        case 11:
                            webpackConfig = _context.sent;


                            // 返回 compiler
                            compiler = extend(webpack(webpackConfig), { entryNum: (0, _keys2.default)(webpackConfig.entry).length });

                            callback(compiler);

                        case 14:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }))();
    }
};