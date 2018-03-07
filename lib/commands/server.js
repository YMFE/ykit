'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var connect = require('connect'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    serveStatic = require('serve-static'),
    serveIndex = require('serve-index'),
    moment = require('moment'),
    webpack = require('webpack'),
    child_process = require('child_process'),
    requireg = require('requireg'),
    logSymbols = require('log-symbols'),
    favicon = require('serve-favicon'),
    webpackDevMiddleware = require('webpack-dev-middleware'),
    hostReplaceMiddleware = require('../modules/HostReplaceMiddleware');

var Manager = require('../modules/GlobalManager.js');
var ServerManager = require('../modules/ServerManager.js');
var ConfigProcessCircle = require('../modules/ConfigProcessCircle.js');
var UtilFs = require('../utils/fs.js');
var UtilPath = require('../utils/path.js');

exports.usage = '开发服务';
exports.abbr = 's';

exports.setOptions = function (optimist) {
    optimist.alias('p', 'port');
    optimist.describe('p', '端口');
    optimist.alias('s', 'https');
    optimist.describe('s', '开启 https 服务');
    optimist.alias('hot', 'hot');
    optimist.describe('hot', '开启 hot-reload');
    optimist.alias('v', 'verbose');
    optimist.describe('v', '显示详细编译信息');
    optimist.alias('m', 'middlewares');
    optimist.describe('m', '加载项目中间件');
};

exports.run = function (options) {
    log('ykit@' + require('../../package.json').version);

    var app = connect(),
        cwd = options.cwd,
        verbose = options.v || options.verbose,
        proxy = options.x || options.proxy,
        hot = options.hot === 'false' ? false : true,
        middlewares = options.mw || options.middlewares,
        isHttps = options.s || options.https,
        mapping = options.mapping || '',
        port = options.p || options.port || 80;

    var middlewareCache = {},
        promiseCache = {},
        allAssetsEntry = {},
        customMiddlewareCache = {
        apps: [],
        middlewares: []
    };

    var assetEntrys = {};
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

    app.use(favicon(sysPath.join(__dirname, '../../static/imgs/favicon.ico')));

    // 预处理
    app.use(function (req, res, next) {
        var extName = sysPath.extname(req.url);
        extName === '.js' && res.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
        extName === '.css' && res.setHeader('Content-Type', 'text/css; charset=UTF-8');
        extName === '.string' && res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });

    // 处理目录映射，比如: R_node_tt:test-egg
    // /R_node_tt/prd/index@dev.css -> /test-egg/prd/index@dev.css
    app.use(function (req, res, next) {

        // 修改请求路径
        if (mapping) {
            var keys = mapping.split(':');
            var originUrl = req.url;
            if (keys.length === 2) {
                req.url = originUrl.replace(keys[0], keys[1]);
                req.mappingUrl = req.url;
            }
        }
        next();
    });

    // logger
    var recentLogs = {};
    app.use(function (req, res, next) {
        // 太近的 log 不会重复打（chrome 的 bug，总是重复请求两次）
        var durationThreshold = 200;
        if (recentLogs[req.url]) {
            if (Date.now() - recentLogs[req.url]._startTime.getTime() > durationThreshold) {
                return next();
            }
        }

        req._startTime = new Date();
        recentLogs[req.url] = req;

        var end = res.end;
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
            var url = req.originalUrl;
            if (req.mappingUrl) {
                url += ' --> ' + req.mappingUrl;
            }
            if (contentLength) {
                contentLength = contentLength > 1024 ? (contentLength / 1024).toFixed(2) + 'KB' : contentLength + 'Bytes';
                contentLength = '( ' + contentLength + ' )';
            }

            format = format.replace(/%date/g, ('[' + moment().format(dateFormat) + ']').grey);
            format = format.replace(/%method/g, '' + req.method.toUpperCase().magenta + (req.mock ? '(mock)'.cyan : ''));
            format = format.replace(/%url/g, decodeURI(url));
            format = format.replace(/%status/g, String(res.statusCode)[statusColor]);
            format = format.replace(/%contentLength/g, contentLength.grey);

            return {
                message: format,
                status: res.statusCode
            };
        }

        return next();
    });

    // custom middlewares
    app.use(function (req, res, next) {
        try {
            var projectInfo = getProjectInfo(req);
            var project = Manager.getProject(projectInfo.projectDir, { cache: false });

            // 当前配置中的 middleware
            var customMiddlewares = project.config.getMiddlewares() || [];

            // 获取哪些是全局 middleware，并加到 customMiddlewareCache 中
            var globalMiddlewares = customMiddlewares.filter(function (mw) {
                return mw.global;
            });
            var cache = customMiddlewareCache;
            if (cache.apps.indexOf(projectInfo.projectName) === -1) {
                cache.apps.push(projectInfo.projectName);
                cache.middlewares = cache.middlewares.concat(globalMiddlewares);
            }

            // 获取当前要走的 middleware
            var currentMiddlewres = cache.middlewares.slice(0).concat(customMiddlewares.filter(function (mw) {
                return !mw.global;
            }));
            var _next = function _next() {
                if (currentMiddlewres.length === 0) {
                    next();
                } else {
                    var nextMw = currentMiddlewres.shift();
                    nextMw(req, res, _next);
                }
            };

            _next();
        } catch (e) {
            logError(e);
            next();
        }
    });

    // app.use(hostReplaceMiddleware);

    // compiler
    app.use(function (req, res, next) {
        var url = req.url,
            compiler = null;

        var _getProjectInfo = getProjectInfo(req),
            projectName = _getProjectInfo.projectName,
            projectDir = _getProjectInfo.projectDir;

        var project = Manager.getProject(projectDir, { cache: false });
        var webpackConfig = project.config._config;
        var outputConfigDir = project.config._config.output.local.path || 'prd';
        var outputAbsDir = sysPath.isAbsolute(outputConfigDir) ? outputConfigDir : sysPath.join(projectDir, outputConfigDir);

        // 添加 source-map
        if (!webpackConfig.devtool) {
            webpackConfig.devtool = 'source-map';
        }

        // 非 output.path 下的资源不做处理
        url = url.replace(projectName + '/', '/');
        if (!projectName || sysPath.join(projectDir, url).indexOf(outputAbsDir) === -1) {
            return next();
        }

        // 清除 YKIT_CACHE_DIR 资源
        ServerManager.removeCacheDir(middlewareCache, projectName, projectDir);

        // 处理资源路径, 去掉 query & 版本号
        var rquery = /\?.+$/;
        var rversion = /@[^.]+(?=\.\w+)/;
        req.url = url = '/' + sysPath.relative(outputAbsDir, sysPath.join(projectDir, url)).replace(rversion, '').replace(rquery, '');

        // 生成 cacheId
        url = url.replace('.map', '').slice(1);
        var cacheId = sysPath.join(projectName, url);

        // hot reload
        var hotEnabled = project.server && project.server.hot || hot;
        if (hotEnabled) {
            ServerManager.setHotServer(webpackConfig, projectDir, projectName, port);
        }

        // 如果发现插件中有 HotModuleReplacementPlugin 则需要编译全部入口，否则无法正常运行
        var shouldCompileAll = webpackConfig.plugins.some(function (plugin, i) {
            // 这里不清楚为什么 plugin instanceof webpack.HotModuleReplacementPlugin 返回 false
            // 所以使用字符串匹配
            if (plugin && plugin.constructor) {
                var isCCP = plugin instanceof webpack.optimize.CommonsChunkPlugin;
                var isHMR = plugin instanceof webpack.HotModuleReplacementPlugin || plugin.constructor.toString() === 'function HotModuleReplacementPlugin() {}';
                return isCCP || isHMR;
            }
        });

        // 如果已有 middlewareCache 直接返回
        if (middlewareCache[cacheId]) {
            return middlewareCache[cacheId](req, res, next);
        }

        // 决定是否跳过编译，直接等待最后返回
        if (shouldCompileAll && !allAssetsEntry[projectName]) {
            allAssetsEntry[projectName] = url;
        }
        var skipCompile = shouldCompileAll && allAssetsEntry[projectName] !== url;

        ServerManager.getCompiler.bind(project)(shouldCompileAll, url, skipCompile, function (compiler) {
            // 如果没找到该资源，在整个编译过程结束后再返回
            if (!compiler) {
                setTimeout(function () {
                    if (promiseCache[projectName]) {
                        _promise2.default.all(promiseCache[projectName]).then(function () {
                            var assetKey = sysPath.join(projectName, url);
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
                    quiet: !verbose, reporter: function reporter(_ref) {
                        var state = _ref.state,
                            stats = _ref.stats;

                        if (!stats) {
                            return resolve();
                        }

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

                        (0, _keys2.default)(stats.compilation.assets).map(function (key) {
                            var keyCacheId = sysPath.join(projectName, key).replace('.map', '');
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
                }

                middleware(req, res, next);
            }
        });
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

        var defaultHttpsConfigPath = sysPath.join(__dirname, '../../static/https/');

        var httpsOpts = void 0;

        if (!globalConfig['https-key'] || !globalConfig['https-crt']) {
            logWarn('缺少 https 证书/秘钥配置，将使用默认，或执行以下命令设置:');
            !globalConfig['https-key'] && logWarn('ykit config set https-key <path-to-your-key>');
            !globalConfig['https-crt'] && logWarn('ykit config set https-crt <path-to-your-crt>');
            httpsOpts = {
                key: fs.readFileSync(defaultHttpsConfigPath + 'server.key'),
                cert: fs.readFileSync(defaultHttpsConfigPath + 'server.crt')
            };
        } else if (!UtilFs.fileExists(globalConfig['https-key']) || !UtilFs.fileExists(globalConfig['https-crt'])) {
            logWarn('https 证书/秘钥配置文件有误，将使用默认，或执行以下命令重新设置:');
            !globalConfig['https-key'] && logWarn('ykit config set https-key <path-to-your-key>');
            !globalConfig['https-crt'] && logWarn('ykit config set https-crt <path-to-your-crt>');
            httpsOpts = {
                key: fs.readFileSync(defaultHttpsConfigPath + 'server.key'),
                cert: fs.readFileSync(defaultHttpsConfigPath + 'server.crt')
            };
        } else {
            httpsOpts = {
                key: fs.readFileSync(globalConfig['https-key']),
                cert: fs.readFileSync(globalConfig['https-crt'])
            };
        }

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

            !server._isHttps && log('Serving at: ' + options.cwd.green.bold);
            logInfo('Ready on: ' + serverUrl.blue.bold.underline + '\n');
        });
    });

    // 权限降级
    if (process.env['SUDO_UID']) {
        process.setuid(parseInt(process.env['SUDO_UID']));
    }

    process.on('uncaughtException', function (err) {
        logError(err.stack);
        process.exit(1);
    });

    function getProjectInfo(req) {
        var dirSections = req.url.split('/');
        var dirLevel = '',
            projectDir = '',
            projectName = '';

        for (var i = 0, len = dirSections.length; i < len; i++) {
            dirLevel += i === 0 ? dirSections[i] : '/' + dirSections[i];

            var searchDir = sysPath.join(cwd, dirLevel, '');
            if (fs.existsSync(searchDir) && fs.lstatSync(searchDir).isDirectory()) {
                var ykitConf = globby.sync(['ykit.*.js', 'ykit.js'], { cwd: searchDir })[0];
                if (ykitConf) {
                    projectDir = searchDir;
                    projectName = sysPath.basename(searchDir);
                    break;
                }
            }
        }

        return {
            projectName: projectName,
            projectDir: projectDir
        };
    }
};