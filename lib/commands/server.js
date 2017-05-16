'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var connect = require('connect'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    socketIO = require('socket.io'),
    serveStatic = require('serve-static'),
    serveIndex = require('serve-index'),
    moment = require('moment'),
    webpack = require('webpack'),
    child_process = require('child_process'),
    requireg = require('requireg'),
    logSymbols = require('log-symbols'),
    favicon = require('serve-favicon'),
    webpackDevMiddleware = require('webpack-dev-middleware'),
    Mock = require('mockjs'),
    httpProxy = require('http-proxy-middleware');

var Manager = require('../modules/manager.js');
var UtilFs = require('../utils/fs.js');
var UtilPath = require('../utils/path.js');

exports.usage = '开发服务';
exports.abbr = 's';

exports.setOptions = function (optimist) {
    optimist.alias('p', 'port');
    optimist.describe('p', '端口');
    optimist.alias('x', 'proxy');
    optimist.describe('x', '开启 proxy 代理服务');
    optimist.alias('s', 'https');
    optimist.describe('s', '开启 https 服务');
    optimist.alias('hot', 'hot');
    optimist.describe('hot', '开启 hot-reload');
    optimist.alias('v', 'verbose');
    optimist.describe('v', '显示详细编译信息');
    optimist.alias('mw', 'middlewares');
    optimist.describe('mw', '加载项目中间件');
    optimist.alias('m', 'mock');
    optimist.describe('m', '启用 mock 服务');
};

exports.run = function (options) {
    var app = connect(),
        cwd = options.cwd,
        verbose = options.v || options.verbose,
        proxy = options.x || options.proxy,
        hot = options.hot,
        middlewares = options.mw || options.middlewares,
        mock = options.m || options.mock,
        isHttps = options.s || options.https,
        port = options.p || options.port || 80;

    var middlewareCache = {},
        promiseCache = {},
        mockCache = {},
        mockRules = {},
        allAssetsEntry = {},
        watchCacheNames = {};

    var io = null,
        assetEntrys = {};

    var usingHotServer = false;
    var dateFormat = 'HH:mm:ss';

    if (middlewares) {
        middlewares.split('|').forEach(function (proName) {
            var pro = Manager.getProject(sysPath.join(cwd, proName));
            if (pro.check() && Array.isArray(pro.middlewares)) {
                pro.middlewares.forEach(function (mw) {
                    return app.use(mw);
                });
            }
        });
    }

    // a simple middleware
    app.use(favicon(sysPath.join(__dirname, '../../static/imgs/favicon.ico')));

    // 预处理
    app.use(function (req, res, next) {
        var extName = sysPath.extname(req.url);
        extName === '.js' && res.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
        extName === '.css' && res.setHeader('Content-Type', 'text/css; charset=UTF-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });

    // logger
    app.use(function (req, res, next) {
        var end = res.end;
        req._startTime = new Date();

        res.end = function (chunk, encoding) {
            res.end = end;
            res.end(chunk, encoding);

            var isNotMap = sysPath.extname(req.url) !== '.map';
            var isNotHotUpdate = req.url.indexOf('hot-update') === -1;
            if (isNotMap && isNotHotUpdate) {
                var format = '%date %status %method %url %contentLength';

                var parseResult = parse(req, res, format);
                return process.nextTick(function () {
                    spinner.text = parseResult.message;
                    parseResult.status >= 400 ? spinner.fail() : spinner.succeed();
                    spinner.text = '';
                });
            }
        };

        function parse(req, res, format) {
            /* eslint-disable */
            var statusColor = function () {
                switch (true) {
                    case 500 <= res.statusCode:
                        return 'red';
                    case 400 <= res.statusCode:
                        return 'yellow';
                    case 300 <= res.statusCode:
                        return 'cyan';
                    case 200 <= res.statusCode:
                        return 'green';
                }
            }();
            /* eslint-enable */

            var contentLength = res._contentLength || '';
            if (contentLength) {
                contentLength = contentLength > 1024 ? (contentLength / 1024).toFixed(2) + 'KB' : contentLength + 'Bytes';
                contentLength = '( ' + contentLength + ' )';
            }

            format = format.replace(/%date/g, ('[' + moment().format(dateFormat) + ']').grey);
            format = format.replace(/%method/g, '' + req.method.toUpperCase().magenta + (req.mock ? '(mock)'.cyan : ''));
            format = format.replace(/%url/g, decodeURI(req.originalUrl));
            format = format.replace(/%status/g, String(res.statusCode)[statusColor]);
            format = format.replace(/%contentLength/g, contentLength.grey);

            return {
                message: format,
                status: res.statusCode
            };
        }

        return next();
    });

    // mock
    app.use(function (req, res, next) {
        var projectInfo = getProjectInfo(req);
        var project = Manager.getProject(projectInfo.projectCwd, { cache: false });
        var cwd = projectInfo.projectCwd;
        var shouldMock = mock || project.server && project.server.mock;

        if (!shouldMock) {
            next();
        }

        if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
            if (!mockCache[projectInfo.projectName]) {
                mockCache[projectInfo.projectName] = true;

                // get mock file
                var mockFile = '';
                if (typeof mock === 'string') {
                    if (UtilFs.fileExists(mock)) {
                        mockFile = mock;
                    } else {
                        logError('Mock file ' + mock.bold + ' not found in ' + cwd.bold);
                    }
                } else {
                    var localConfigFiles = getMockFiles(['mock.js', 'mock.json']);
                    if (localConfigFiles.length > 0) {
                        mockFile = localConfigFiles[0];
                    }
                }

                // get mock rules
                if (mockFile) {
                    var ext = sysPath.extname(mockFile);
                    if (ext === '.js') {
                        var appMockRules = require(sysPath.join(cwd, mockFile));
                        var formattedRules = [];
                        if ((typeof appMockRules === 'undefined' ? 'undefined' : (0, _typeof3.default)(appMockRules)) === 'object') {
                            log(('Start using ' + mockFile + ' for simulation.').cyan);
                            (0, _keys2.default)(appMockRules).map(function (itemKey) {
                                if (itemKey === 'rules') {
                                    formattedRules = formattedRules.concat(appMockRules[itemKey]);
                                } else {
                                    formattedRules.push({
                                        pattern: itemKey,
                                        respondwith: appMockRules[itemKey]
                                    });
                                }
                            });
                            mockRules[projectInfo.projectName] = formattedRules.map(function (r) {
                                return extend(r, { cwd: cwd });
                            });
                        } else {
                            logError('Invalid mock rules, please check your mock config.');
                        }
                    }
                }
            }

            next();
        } else {
            var mockResult = void 0;
            var mockAction = function mockAction(rule, req, res) {
                var rw = rule.respondwith;
                var cwd = rule.cwd; // different from current req cwd

                var resObj = {};

                // TODO handle object

                // handle file
                var mockPath = sysPath.join(cwd, rw);
                if (UtilFs.fileExists(mockPath)) {
                    if (sysPath.extname(rw) === '.js' || sysPath.extname(rw) === '.json') {
                        resObj = Mock.mock(require(mockPath));
                    } else if (sysPath.extname(rw)) {
                        try {
                            resObj = Mock.mock(JSON.parse(fs.readFileSync(mockPath, 'utf-8')));
                        } catch (e) {
                            logError('Parse error in ' + mockPath.bold + ' \n' + e);
                        }
                    }
                } else {
                    logError('Not found ' + mockPath.bold);
                }

                req.mock = true;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end((0, _stringify2.default)(resObj));
            };

            (0, _keys2.default)(mockRules).map(function (mockApp) {
                mockRules[mockApp].map(function (rule) {
                    var isReg = Object.prototype.toString.call(rule.pattern).indexOf('RegExp') > -1;
                    var result = void 0;

                    if (isReg) {
                        result = req.url.match(rule.pattern);
                    } else {
                        result = req.url.indexOf(rule.pattern) === 0;
                    }

                    if (result) {
                        mockResult = mockAction(rule, req, res);
                    }
                });
            });

            if (!mockResult) {
                next();
            }
        }

        function getMockFiles() {
            var names = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
            var searchPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            console.log();
            return globby.sync(['mock.js', 'mock.json'], { cwd: sysPath.join(cwd, searchPath) });
        }
    });

    app.use(function (req, res, next) {
        try {
            var projectInfo = getProjectInfo(req);
            var project = Manager.getProject(projectInfo.projectCwd, { cache: false });
            var customMiddlewares = project.config.getMiddlewares();
            var _next = function _next() {
                if (customMiddlewares.length === 0) {
                    next();
                } else {
                    var nextMw = customMiddlewares.shift();
                    nextMw(req, res, _next);
                }
            };

            _next();
        } catch (e) {
            next();
        }
    });

    // compiler
    // 记录 project
    app.use(function (req, res, next) {
        var url = req.url,
            keys = url.split('/'),
            compiler = null;

        var projectInfo = getProjectInfo(req);
        var projectName = projectInfo.projectName;
        var projectCwd = projectInfo.projectCwd;
        var project = Manager.getProject(projectCwd, { cache: false });
        var wpConfig = project.config._config;
        var outputDir = project.config._config.output.local.path || 'prd';

        // 非 output.path 下的资源不做处理
        if (keys[2] !== sysPath.relative(projectCwd, outputDir)) {
            next();
            return;
        }

        // 清除 YKIT_CACHE_DIR 资源
        var isFirstCompileDir = true;
        (0, _keys2.default)(middlewareCache).map(function (cacheName) {
            if (cacheName.startsWith(projectName)) {
                isFirstCompileDir = false;
            }
        });
        if (isFirstCompileDir) {
            UtilFs.deleteFolderRecursive(sysPath.join(projectCwd, YKIT_CACHE_DIR), true);
        }

        // 处理资源路径, 去掉 query & 版本号
        var rquery = /\?.+$/;
        var rversion = /@[^\.]+(?=\.\w+)/;
        req.url = '/' + keys.slice(3).join('/').replace(rversion, '').replace(rquery, '');

        // 生成 cacheId
        var requestUrl = req.url.replace('.map', '').slice(1);
        var cacheId = sysPath.join(projectName, requestUrl);

        // 寻找已有的 middlewareCache
        if (middlewareCache[cacheId]) {
            middlewareCache[cacheId](req, res, next);
            return;
        }

        // hot reload
        var hotEnabled = project.server && project.server.hot || hot;
        if (hotEnabled) {
            // 修改 publicPath 为当前服务
            var localPublicPath = wpConfig.output.local.publicPath;
            if (project.config.replacingPublicPath !== false) {
                var hostReg = /(http:|https:)?(\/\/)([^\/]+)/i;
                if (localPublicPath && localPublicPath.match(hostReg).length === 4) {
                    localPublicPath = '/' + UtilPath.normalize(localPublicPath, false);
                    localPublicPath = localPublicPath.replace(hostReg, function (matches, httpStr, splitStr, host) {
                        httpStr = httpStr || '';
                        return httpStr + '//' + '127.0.0.1:' + port;
                    });
                    wpConfig.output.local.publicPath = localPublicPath;
                } else {
                    // hot 且 未指定 publicPath 需要手动设置方式 hot.json 404
                    var relativePath = sysPath.relative(projectCwd, wpConfig.output.local.path);
                    wpConfig.output.local.publicPath = 'http://127.0.0.1:' + port + '/' + projectName + '/' + relativePath + '/';
                }
            }

            wpConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

            if (!usingHotServer) {
                usingHotServer = projectName;
                if ((0, _typeof3.default)(wpConfig.entry) === 'object') {
                    (0, _keys2.default)(wpConfig.entry).map(function (key) {
                        var entryItem = wpConfig.entry[key];
                        if (sysPath.extname(entryItem[entryItem.length - 1]) === '.js') {
                            var whmPath = require.resolve('webpack-hot-middleware/client');
                            var hotPath = 'http://127.0.0.1:' + port + '/__webpack_hmr';
                            entryItem.unshift(whmPath + '?reload=true&path=' + hotPath + '&timeout=9999999&overlay=false');
                        }
                        return entryItem;
                    });
                }
            }
        }

        // 如果发现插件中有 HotModuleReplacementPlugin 则需要编译全部入口，否则无法正常运行
        var shouldCompileAllEntries = wpConfig.plugins.some(function (plugin, i) {
            // 这里不清楚为什么 plugin instanceof webpack.HotModuleReplacementPlugin 返回 false
            // 所以使用字符串匹配
            if (plugin && plugin.constructor) {
                var isCCP = plugin instanceof webpack.optimize.CommonsChunkPlugin;
                var isHMR = plugin.constructor.toString() === 'function HotModuleReplacementPlugin() {}';
                return isCCP || isHMR;
            }
        });

        if (shouldCompileAllEntries && !allAssetsEntry[projectName]) {
            allAssetsEntry[projectName] = requestUrl;
        }

        var nextConfig = void 0;
        if (!shouldCompileAllEntries || allAssetsEntry[projectName] === requestUrl) {
            compiler = project.getServerCompiler(function (config) {

                config.plugins.push(require('../plugins/progressBarPlugin.js'));
                config.plugins.push(require('../plugins/compileInfoPlugin.js'));

                nextConfig = extend({}, config);

                // 注入 sockitIO
                if (project.server && project.server.overlay) {
                    nextConfig.module.postLoaders.push({
                        test: /\.(js)$/,
                        loader: sysPath.join(__dirname, '../modules/SocketClientLoader.js?cacheId=' + cacheId)
                    });
                }

                if (shouldCompileAllEntries) {
                    return nextConfig;
                } else {
                    // entry 应该是个空对象, 这样如果没有找到请求对应的 entry, 就不会编译全部入口
                    nextConfig.entry = {};

                    // 将 webpack entry 设置为当前请求的资源
                    (0, _keys2.default)(config.entry).map(function (entryKey) {
                        var entryItem = config.entry[entryKey];

                        var isRequestingEntry = false,
                            entryPath = '';

                        if (Array.isArray(entryItem)) {
                            entryPath = entryItem[entryItem.length - 1];
                        } else {
                            entryPath = entryItem;
                        }

                        // 应用后缀转换规则
                        var entryExtNames = config.entryExtNames;
                        (0, _keys2.default)(entryExtNames).map(function (targetExtName) {
                            var exts = entryExtNames[targetExtName];

                            // 如果是 css 要考虑 css.js 的情况
                            if (targetExtName === 'css') {
                                exts = exts.concat(entryExtNames[targetExtName].map(function (name) {
                                    return name + '.js';
                                }));
                            }

                            // 创建正则匹配
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
                        var matchingPath = sysPath.normalize(entryPath) === sysPath.normalize(requestUrl);
                        var matchingKey = sysPath.normalize(requestUrl) === entryKey + sysPath.extname(requestUrl);

                        if (matchingPath || matchingKey) {
                            isRequestingEntry = true;
                        }

                        if (isRequestingEntry) {
                            nextConfig.entry = (0, _defineProperty3.default)({}, entryKey, entryItem);
                        }
                    });

                    return nextConfig;
                }
            });
        }

        // 如果没找到该资源，在整个编译过程结束后再返回
        if (!nextConfig || (0, _keys2.default)(nextConfig.entry).length === 0) {
            setTimeout(function () {
                if (promiseCache[projectName]) {
                    _promise2.default.all(promiseCache[projectName]).then(function () {
                        var assetKey = sysPath.join(projectName, requestUrl);
                        if (middlewareCache[assetKey]) {
                            middlewareCache[assetKey](req, res, next);
                        } else {
                            next();
                        }
                    });
                } else {
                    res.statusCode = 404;
                    res.end('[ykit] - js入口未找到，请检查项目' + projectName + '的 ykit 配置文件.');
                }
            }, 100);
        } else {
            // 生成该请求的 promiseCache
            var resolve = null,
                reject = null;

            var requestPromise = new _promise2.default(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            if (!promiseCache[projectName]) {
                promiseCache[projectName] = [requestPromise];
            } else {
                promiseCache[projectName].push(requestPromise);
            }

            var middleware = middlewareCache[cacheId] = webpackDevMiddleware(compiler, {
                quiet: true, reporter: function reporter(_ref) {
                    var state = _ref.state,
                        stats = _ref.stats;

                    // 打印编译完成时间（小于 100ms 不展示）
                    if (!stats.hasErrors() && !stats.hasWarnings()) {
                        var minDuration = 100;
                        if (stats.endTime - stats.startTime > minDuration) {
                            var dateLog = '[' + moment().format(dateFormat) + ']';
                            var successText = ' Compiled successfully in ' + (stats.endTime - stats.startTime) + 'ms.';
                            spinner.text = dateLog.grey + successText.green;
                            spinner.succeed();
                        }
                    }
                    spinner.stop();
                    spinner.text = '';

                    // emit compile info by socket
                    var statsInfo = stats.toJson({ errorDetails: false });
                    var assetName = cacheId;
                    assetEntrys[assetName] = {
                        compilationId: statsInfo.hash,
                        errors: statsInfo.errors
                    };
                    io.emit('testAppID', assetEntrys);

                    (0, _keys2.default)(stats.compilation.assets).map(function (key) {
                        var keyCacheId = sysPath.join(projectName, key);
                        middlewareCache[keyCacheId] = middleware;

                        if (verbose) {
                            log('emitted asset:', stats.compilation.assets[key].existsAt);
                        }
                    });

                    resolve();
                }
            });

            if (hotEnabled) {
                app.use(require('webpack-hot-middleware')(compiler, {
                    log: false,
                    path: '/__webpack_hmr'
                }));

                logInfo('Start hot reloader server.');
            }

            middleware(req, res, next);
        }

        // 检测config文件变化
        watchConfig(project, cacheId);
    });

    app.use(serveStatic(cwd, {
        redirect: false,
        index: false
    }));
    app.use(serveIndex(cwd, { icons: true }));

    // 启动 http server 和 https server(如果有)
    var servers = [];
    servers.push(extend(http.createServer(app), { _port: port }));
    if (isHttps) {
        var globalConfig = JSON.parse(fs.readFileSync(YKIT_RC, { encoding: 'utf8' }));

        if (!globalConfig['https-key'] || !globalConfig['https-crt']) {
            logWarn('缺少 https 证书/秘钥配置，将使用默认，或执行以下命令设置:');
            !globalConfig['https-key'] && logWarn('ykit config set https-key <path-to-your-key>');
            !globalConfig['https-crt'] && logWarn('ykit config set https-crt <path-to-your-crt>');
        }

        var defaultHttpsConfigPath = sysPath.join(__dirname, '../../static/https/');
        var httpsOpts = {
            key: fs.readFileSync(globalConfig['https-key'] || defaultHttpsConfigPath + 'server.key'),
            cert: fs.readFileSync(globalConfig['https-crt'] || defaultHttpsConfigPath + 'server.crt')
        };
        servers.push(extend(https.createServer(httpsOpts, app), { _port: '443', _isHttps: true }));
    }

    // setup server
    servers.forEach(function (server) {
        server.on('error', function (e) {
            if (e.code === 'EACCES') {
                logError('Permission denied. Please try running again as root/Administrator.');
            } else if (e.code === 'EADDRINUSE') {
                logError('Port ' + server._port + ' has been opened by another application.');
            }
            process.exit(1);
        });

        server.listen(server._port, function () {
            var serverUrl = (server._isHttps ? 'https' : 'http') + '://127.0.0.1:' + server._port;

            !server._isHttps && log('Starting up server, serving at: ' + options.cwd);
            logInfo('Available on: ' + serverUrl.underline);

            // socket
            if (!server._isHttps) {
                io = socketIO(server);
                io.on('connection', function (socket) {
                    io.emit('testAppID', assetEntrys);
                });
            }
        });
    });

    // proxy
    var proxyProcess;
    if (proxy) {
        var proxyPath = sysPath.join(requireg.resolve('jerryproxy'), '../bin/jerry.js');
        proxyProcess = child_process.fork(proxyPath);
    }

    // 权限降级
    if (process.env['SUDO_UID']) {
        process.setuid(parseInt(process.env['SUDO_UID']));
    }

    process.on('uncaughtException', function (err) {
        logError(err.stack);
        process.exit(1);
    });

    // exitHandler && catches ctrl+c event
    process.on('exit', exitHandler.bind(null));
    process.on('SIGINT', exitHandler.bind(null));
    function exitHandler() {
        // cleanup
        proxyProcess && proxyProcess.kill('SIGINT');
        process.exit(0);
    }

    // 监测配置文件变化
    function watchConfig(project, cacheName) {
        var cwdConfigPath = sysPath.resolve(project.config._config.cwd, project.configFile);

        if (watchCacheNames[cwdConfigPath]) {
            if (watchCacheNames[cwdConfigPath].indexOf(cacheName) === -1) {
                watchCacheNames[cwdConfigPath].push(cacheName);
            }
        } else {
            watchCacheNames[cwdConfigPath] = [cacheName];

            fs.watchFile(cwdConfigPath, { interval: 2000 }, function () {
                watchCacheNames[cwdConfigPath].map(function (cacheName) {
                    middlewareCache[cacheName] = null;
                });
                UtilFs.deleteFolderRecursive(project.cachePath, true);
            });
        }
    }

    function getProjectInfo(req) {
        var url = req.url,
            keys = url.split('/'),
            projectName = keys[1],
            projectCwd = sysPath.join(cwd, projectName);

        return {
            projectName: projectName,
            projectCwd: projectCwd
        };
    }
};