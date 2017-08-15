'use strict';

const connect = require('connect'),
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
    hostReplaceMiddleware = require('../modules/HostReplaceMiddleware'),
    httpProxy = require('http-proxy-middleware');

const Manager = require('../modules/manager.js');
const ServerManager = require('../modules/ServerManager.js');
const ConfigProcessCircle = require('../modules/ConfigProcessCircle.js');
const UtilFs = require('../utils/fs.js');
const UtilPath = require('../utils/path.js');

exports.usage = '开发服务';
exports.abbr = 's';

exports.setOptions = (optimist) => {
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
    optimist.alias('m', 'middlewares');
    optimist.describe('m', '加载项目中间件');
};

exports.run = (options) => {
    let app = connect(),
        cwd = options.cwd,
        verbose = options.v || options.verbose,
        proxy = options.x || options.proxy,
        hot = options.hot,
        middlewares = options.mw || options.middlewares,
        isHttps = options.s || options.https,
        port = options.p || options.port || 80;

    let middlewareCache = {},
        promiseCache = {},
        allAssetsEntry = {},
        customMiddlewareCache = {
            apps: [],
            middlewares: []
        };

    let io = null,
        assetEntrys = {};

    let usingHotServer = false;
    const dateFormat = 'HH:mm:ss';

    if (middlewares) {
        middlewares.split('|').forEach((proName) => {
            let pro = Manager.getProject(sysPath.join(cwd, proName));
            if (pro.check() && Array.isArray(pro.middlewares)) {
                pro.middlewares.forEach((mw) => app.use(mw));
            }
        });
    }

    app.use(favicon(sysPath.join(__dirname, '../../static/imgs/favicon.ico')));

    // 预处理
    app.use((req, res, next) => {
        const extName = sysPath.extname(req.url);
        extName === '.js' && res.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
        extName === '.css' && res.setHeader('Content-Type', 'text/css; charset=UTF-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });

    // logger
    app.use((req, res, next) => {
        const end = res.end;
        req._startTime = new Date;

        res.end = (chunk, encoding) => {
            res.end = end;
            res.end(chunk, encoding);

            const isNotMap = sysPath.extname(req.url) !== '.map';
            const isNotHotUpdate = req.url.indexOf('hot-update') === -1;
            if(isNotMap && isNotHotUpdate) {
                let format = '%date %status %method %url %contentLength';

                const parseResult = parse(req, res, format);
                return process.nextTick(() => {
                    spinner.text = parseResult.message;
                    parseResult.status >= 400 ? spinner.fail() : spinner.succeed();
                    spinner.text = '';
                });
            }
        };

        function parse(req, res, format) {
            /* eslint-disable */
            const statusColor = (function () {
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
            })();
            /* eslint-enable */

            let contentLength = res._contentLength || '';
            if (contentLength) {
                contentLength = contentLength > 1024
                    ? (contentLength / 1024).toFixed(2) + 'KB'
                    : contentLength + 'Bytes';
                contentLength = '( ' + contentLength + ' )';
            }

            format = format.replace(/%date/g, `[${moment().format(dateFormat)}]`.grey);
            format = format.replace(/%method/g, `${req.method.toUpperCase().magenta}${req.mock ? '(mock)'.cyan : ''}`);
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

    // custom middlewares
    app.use(function (req, res, next) {
        try {
            const projectInfo = getProjectInfo(req);
            const project = Manager.getProject(projectInfo.projectDir, { cache: false });

            // 当前配置中的 middleware
            const customMiddlewares = project.config.getMiddlewares() || [];

            // 获取哪些是全局 middleware，并加到 customMiddlewareCache 中
            const globalMiddlewares = customMiddlewares.filter((mw) => mw.global);
            const cache = customMiddlewareCache;
            if(cache.apps.indexOf(projectInfo.projectName) === -1) {
                cache.apps.push(projectInfo.projectName);
                cache.middlewares = cache.middlewares.concat(globalMiddlewares);
            }

            // 获取当前要走的 middleware
            const currentMiddlewres = cache.middlewares.slice(0).concat(
                    customMiddlewares.filter((mw) => !mw.global)
                );
            const _next = () => {
                if (currentMiddlewres.length === 0) {
                    next();
                } else {
                    const nextMw = currentMiddlewres.shift();
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
    app.use((req, res, next) => {
        let url = req.url,
            compiler = null;

        const {projectName, projectDir} = getProjectInfo(req);
        const project = Manager.getProject(projectDir, { cache: false });
        const webpackConfig = project.config._config;
        const outputConfigDir = project.config._config.output.local.path || 'prd';
        const outputAbsDir = sysPath.isAbsolute(outputConfigDir)
                            ? outputConfigDir
                            : sysPath.join(projectDir, outputConfigDir);

        // 非 output.path 下的资源不做处理
        url = url.split(projectName).length > 1 ? url.split(projectName)[1] : url;
        if(!projectName || sysPath.join(projectDir, url).indexOf(outputAbsDir) === -1) {
            return next();
        }

        // 清除 YKIT_CACHE_DIR 资源
        ServerManager.removeCacheDir(middlewareCache, projectName, projectDir);

        // 处理资源路径, 去掉 query & 版本号
        const rquery = /\?.+$/;
        const rversion = /@[^.]+(?=\.\w+)/;
        req.url = url = '/' + sysPath.relative(outputAbsDir, sysPath.join(projectDir, url))
                    .replace(rversion, '')
                    .replace(rquery, '');

        // 生成 cacheId
        url = url.replace('.map', '').slice(1);
        const cacheId = sysPath.join(projectName, url);

        // hot reload
        const hotEnabled = (project.server && project.server.hot) || hot;
        if(hotEnabled) {
            ServerManager.setHotServer(webpackConfig, projectDir, projectName, port);
        }

        // 如果发现插件中有 HotModuleReplacementPlugin 则需要编译全部入口，否则无法正常运行
        const shouldCompileAllEntries = webpackConfig.plugins.some((plugin, i) => {
            // 这里不清楚为什么 plugin instanceof webpack.HotModuleReplacementPlugin 返回 false
            // 所以使用字符串匹配
            if(plugin && plugin.constructor) {
                const isCCP = plugin instanceof webpack.optimize.CommonsChunkPlugin;
                const isHMR = plugin instanceof webpack.HotModuleReplacementPlugin
                            || plugin.constructor.toString() === 'function HotModuleReplacementPlugin() {}';
                return isCCP || isHMR;
            }
        });

        if(shouldCompileAllEntries && !allAssetsEntry[projectName]) {
            allAssetsEntry[projectName] = url;
        }

        // 寻找已有的 middlewareCache
        if (middlewareCache[cacheId]) {
            middlewareCache[cacheId](req, res, next);
            middlewareCache[cacheId]._visit += 1;
            return;
        }

        if(!shouldCompileAllEntries || allAssetsEntry[projectName] === url) {
            ServerManager.getCompiler.bind(project)(shouldCompileAllEntries, url, (compiler) => {
                // 如果没找到该资源，在整个编译过程结束后再返回
                if (!compiler) {
                    setTimeout(() => {
                        if (promiseCache[projectName]) {
                            Promise.all(promiseCache[projectName]).then(function () {
                                const assetKey = sysPath.join(projectName, url);
                                if(middlewareCache[assetKey]) {
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
                    let resolve = null,
                        reject = null;

                    const requestPromise = new Promise((res, rej) => {
                        resolve = res;
                        reject = rej;
                    });

                    if (!promiseCache[projectName]) {
                        promiseCache[projectName] = [requestPromise];
                    } else {
                        promiseCache[projectName].push(requestPromise);
                    }

                    const middleware = middlewareCache[cacheId] = webpackDevMiddleware(
                        compiler,
                        {
                            quiet: !verbose, reporter: ({state, stats}) => {
                                if(!stats) {
                                    return resolve();
                                }

                                // 打印编译完成时间（小于 100ms 不展示）
                                if(!stats.hasErrors() && !stats.hasWarnings()) {
                                    const minDuration = 100;
                                    if(stats.endTime - stats.startTime > minDuration) {
                                        const dateLog = '[' + moment().format(dateFormat) + ']';
                                        const successText =  ' Compiled successfully in ' + (stats.endTime - stats.startTime) + 'ms.';
                                        spinner.text = dateLog.grey + successText.green;
                                        spinner.succeed();
                                    }
                                }
                                spinner.stop();
                                spinner.text = '';

                                // emit compile info by socket
                                const statsInfo = stats.toJson({errorDetails: false});
                                const assetName = cacheId;
                                assetEntrys[assetName] = {
                                    compilationId: statsInfo.hash,
                                    errors: statsInfo.errors
                                };
                                io.emit('testAppID', assetEntrys);

                                Object.keys(stats.compilation.assets).map((key) => {
                                    const keyCacheId = sysPath.join(projectName, key).replace('.map', '');
                                    middlewareCache[keyCacheId] = middleware;

                                    if(verbose) {
                                        log('emitted asset:', stats.compilation.assets[key].existsAt);
                                    }
                                });

                                resolve();
                            }
                        }
                    );

                    if(hotEnabled) {
                        app.use(require('webpack-hot-middleware')(compiler, {
                            log: false,
                            path: '/__webpack_hmr'
                        }));
                    }

                    middleware(req, res, next);
                }
            });
        }
    });

    app.use(serveStatic(cwd, {
        redirect: false,
        index: false
    }));
    app.use(serveIndex(cwd, {icons: true}));

    // 启动 http server 和 https server(如果有)
    let servers = [];
    servers.push(extend(http.createServer(app), { _port: port }));
    if (isHttps) {
        const globalConfig = JSON.parse(fs.readFileSync(YKIT_RC, { encoding: 'utf8' }));

        const defaultHttpsConfigPath = sysPath.join(__dirname, '../../static/https/');

        let httpsOpts;

        if (!globalConfig['https-key'] || !globalConfig['https-crt'] ) {
            logWarn('缺少 https 证书/秘钥配置，将使用默认，或执行以下命令设置:');
            !globalConfig['https-key'] && logWarn('ykit config set https-key <path-to-your-key>');
            !globalConfig['https-crt'] && logWarn('ykit config set https-crt <path-to-your-crt>');
            httpsOpts = {
                key: fs.readFileSync(defaultHttpsConfigPath + 'server.key'),
                cert: fs.readFileSync(defaultHttpsConfigPath + 'server.crt')
            };
        } else if(!UtilFs.fileExists(globalConfig['https-key']) || !UtilFs.fileExists(globalConfig['https-crt'])) {
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
    servers.forEach((server) => {
        server.on('error', (e) => {
            if (e.code === 'EACCES') {
                logError('Permission denied. Please try running again as root/Administrator.');
            } else if (e.code === 'EADDRINUSE') {
                logError('Port ' + server._port + ' has been opened by another application.');
            }
            process.exit(1);
        });

        server.listen(server._port, () => {
            const serverUrl = (server._isHttps ? 'https' : 'http')
                + '://127.0.0.1:'
                + server._port;

            !server._isHttps && log('Starting up server, serving at: ' + options.cwd);
            logInfo('Available on: ' + serverUrl.underline);

            // socket
            if(!server._isHttps) {
                io = socketIO(server);
                io.on('connection', function(socket) {
                    io.emit('testAppID', assetEntrys);
                });
            }
        });
    });

    // proxy
    var proxyProcess;
    if (proxy) {
        const proxyPath = sysPath.join(requireg.resolve('jerryproxy-ykit'), '../bin/jerry.js');
        proxyProcess = child_process.fork(proxyPath);
    }

    // 权限降级
    if (process.env['SUDO_UID']) {
        process.setuid(parseInt(process.env['SUDO_UID']));
    }

    process.on('uncaughtException', (err) => {
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

    function getProjectInfo(req) {
        const dirSections = req.url.split('/');
        let dirLevel = '',
            projectDir = '',
            projectName = '';

        for(let i = 0, len = dirSections.length; i < len; i++) {
            dirLevel += i === 0 ? dirSections[i] : '/' + dirSections[i] ;

            const searchDir = sysPath.join(cwd, dirLevel, '');
            if (fs.existsSync(searchDir) && fs.lstatSync(searchDir).isDirectory()) {
                const ykitConf = globby.sync(['ykit.*.js', 'ykit.js'], {cwd: searchDir})[0];
                if(ykitConf) {
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
