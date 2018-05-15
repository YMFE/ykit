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
        watchCacheNames = {},
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

    // a simple middleware
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
    app.use(function (req, res, next) {
        let url = req.url,
            compiler = null;

        const projectInfo = getProjectInfo(req);
        const projectName = projectInfo.projectName;
        const projectDir = projectInfo.projectDir;
        const project = Manager.getProject(projectDir, { cache: false });
        const wpConfig = project.config._config;
        const outputConfigDir = project.config._config.output.local.path || 'prd';
        const outputAbsDir = sysPath.isAbsolute(outputConfigDir)
                            ? outputConfigDir
                            : sysPath.join(projectDir, outputConfigDir);
        const maxMiddleware = project.server && project.server.maxMiddleware;

        // 非 output.path 下的资源不做处理
        url = url.replace(projectName + '/', '/');
        if(!projectName || sysPath.join(projectDir, url).indexOf(outputAbsDir) === -1) {
            return next();
        }

        // 清除 YKIT_CACHE_DIR 资源
        let isFirstCompileDir = true;
        Object.keys(middlewareCache).map((cacheName) => {
            if(cacheName.startsWith(projectName)) {
                isFirstCompileDir = false;
            }
        });
        if(isFirstCompileDir) {
            UtilFs.deleteFolderRecursive(sysPath.join(projectDir, YKIT_CACHE_DIR), true);
        }

        // 处理资源路径, 去掉 query & 版本号
        const rquery = /\?.+$/;
        const rversion = /@[^\.]+(?=\.\w+)/;
        req.url = url = '/' + sysPath.relative(outputAbsDir, sysPath.join(projectDir, url))
                    .replace(rversion, '')
                    .replace(rquery, '');

        // 生成 cacheId
        url = url.replace('.map', '').slice(1);
        const cacheId = sysPath.join(projectName, url);

        // hot reload
        const hotEnabled = (project.server && project.server.hot) || hot;
        if(hotEnabled) {
            // 修改 publicPath 为当前服务
            let localPublicPath = wpConfig.output.local.publicPath;
            if(project.config.replacingPublicPath !== false) {
                const hostReg = /(http:|https:)?(\/\/)([^\/]+)/i;
                if(localPublicPath && localPublicPath.match(hostReg).length === 4) {
                    localPublicPath = '/' + UtilPath.normalize(localPublicPath, false);
                    localPublicPath = localPublicPath.replace(hostReg, (matches, httpStr, splitStr, host) => {
                        httpStr = httpStr || '';
                        return httpStr + '//' + '127.0.0.1:' + port;
                    });
                    wpConfig.output.local.publicPath = localPublicPath;
                } else {
                    // hot 且 未指定 publicPath 需要手动设置方式 hot.json 404
                    const relativePath = sysPath.relative(projectDir, wpConfig.output.local.path);
                    wpConfig.output.local.publicPath = `http://127.0.0.1:${port}/${projectName}/${relativePath}/`;
                }
            }

            wpConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

            if(!usingHotServer) {
                usingHotServer = projectName;
                if(typeof wpConfig.entry === 'object') {
                    Object.keys(wpConfig.entry).map((key) => {
                        let entryItem = wpConfig.entry[key];
                        if(sysPath.extname(entryItem[entryItem.length - 1]) === '.js') {
                            const whmPath = require.resolve('webpack-hot-middleware/client');
                            const hotPath = `http://127.0.0.1:${port}/__webpack_hmr`;
                            entryItem.unshift(whmPath + '?reload=true&path=' + hotPath + '&timeout=9999999&overlay=false');
                        }
                        return entryItem;
                    });
                }
            }
        }

        // 如果发现插件中有 HotModuleReplacementPlugin 则需要编译全部入口，否则无法正常运行
        const shouldCompileAllEntries = wpConfig.plugins.some((plugin, i) => {
            // 这里不清楚为什么 plugin instanceof webpack.HotModuleReplacementPlugin 返回 false
            // 所以使用字符串匹配
            if(plugin && plugin.constructor) {
                const isCCP = plugin instanceof webpack.optimize.CommonsChunkPlugin;
                const isHMR = plugin.constructor.toString() === 'function HotModuleReplacementPlugin() {}';
                return isCCP || isHMR;
            }
        });

        if(shouldCompileAllEntries && !allAssetsEntry[projectName]) {
            allAssetsEntry[projectName] = url;
        }

        // 按照访问次数/访问间隔做权重排序，默认保留三个 middleware
        if(maxMiddleware) {
            const now = +new Date();
            const middlewareList = Object.keys(middlewareCache)
                .map(key => {
                    const middleware = middlewareCache[key];
                    return middleware ? {
                        key,
                        middleware: middleware,
                        weight: middleware._visit / (now - middleware._timestamp) * 1000
                    } : null;
                })
                .filter(v => v)
                .sort((a, b) =>  b.weight - a.weight);

            let removeLen = middlewareList.length - maxMiddleware;
            let index = middlewareList.length - 1;

            while (removeLen > 0) {
                const key = middlewareList[index].key;
                if (key !== cacheId) {
                    var md = middlewareCache[key];
                    delete middlewareCache[key];
                    md.close();
                }

                removeLen -= 1;
                index -= 1;
            }
        }

        // 寻找已有的 middlewareCache
        if (middlewareCache[cacheId]) {
            middlewareCache[cacheId](req, res, next);
            middlewareCache[cacheId]._visit += 1;
            return;
        }

        let nextConfig;
        if(!shouldCompileAllEntries || allAssetsEntry[projectName] === url) {
            compiler = project.getServerCompiler(function (config) {

                config.plugins.push(require('../plugins/progressBarPlugin.js'));
                config.plugins.push(require('../plugins/compileInfoPlugin.js'));

                nextConfig = extend({}, config);

                // 注入 sockitIO
                if(project.server && project.server.overlay) {
                    nextConfig.module.postLoaders.push({
                        test: /\.(js)$/,
                        loader: sysPath.join(__dirname, '../modules/SocketClientLoader.js?cacheId=' + cacheId)
                    });
                }

                if(shouldCompileAllEntries) {
                    return nextConfig;
                } else {
                    // entry 应该是个空对象, 这样如果没有找到请求对应的 entry, 就不会编译全部入口
                    nextConfig.entry = {};

                    // 将 webpack entry 设置为当前请求的资源
                    Object.keys(config.entry).map((entryKey) => {
                        const entryItem = config.entry[entryKey];

                        let isRequestingEntry = false,
                            entryPath = '';

                        if (Array.isArray(entryItem)) {
                            entryPath = entryItem[entryItem.length - 1];
                        } else {
                            entryPath = entryItem;
                        }

                        // 应用后缀转换规则
                        const entryExtNames = config.entryExtNames;
                        Object.keys(entryExtNames).map((targetExtName) => {
                            let exts = entryExtNames[targetExtName];

                            // 如果是 css 要考虑 css.js 的情况
                            if(targetExtName === 'css') {
                                exts = exts.concat(
                                    entryExtNames[targetExtName].map((name) => {
                                        return name + '.js';
                                    })
                                );
                            }

                            // 创建正则匹配
                            exts = exts.map((name) => {
                                return name + '$';
                            });
                            const replaceReg = new RegExp('\\' + exts.join('|\\'));

                            entryPath = UtilPath.normalize(entryPath.replace(replaceReg, '.' + targetExtName));
                        });

                        // 如果是 ykit 处理过的样式文件，将其变为正常的请求路径(../.ykit_cache/main/index.css => main/index.css)
                        if (entryPath.indexOf('.css.js') && entryPath.indexOf('.ykit_cache/') > 1) {
                            entryPath = entryPath.split('.ykit_cache/')[1];
                        }

                        // 判断所请求的资源是否在入口配置中
                        const matchingPath = sysPath.normalize(entryPath) === sysPath.normalize(url);
                        const matchingKey = sysPath.normalize(url) === entryKey + sysPath.extname(url);

                        if (matchingPath || matchingKey) {
                            isRequestingEntry = true;
                        }

                        if (isRequestingEntry) {
                            nextConfig.entry = {
                                [entryKey]: entryItem
                            };
                        }
                    });

                    return nextConfig;
                }
            });
        }

        // 如果没找到该资源，在整个编译过程结束后再返回
        if (!nextConfig || Object.keys(nextConfig.entry).length === 0) {
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

            middleware._timestamp = +new Date();
            middleware._visit = 1;

            if(hotEnabled) {
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
        }else if(!UtilFs.fileExists(globalConfig['https-key']) || !UtilFs.fileExists(globalConfig['https-crt'])){
            logWarn('https 证书/秘钥配置文件有误，将使用默认，或执行以下命令重新设置:');
            !globalConfig['https-key'] && logWarn('ykit config set https-key <path-to-your-key>');
            !globalConfig['https-crt'] && logWarn('ykit config set https-crt <path-to-your-crt>');
            httpsOpts = {
                key: fs.readFileSync(defaultHttpsConfigPath + 'server.key'),
                cert: fs.readFileSync(defaultHttpsConfigPath + 'server.crt')
            };
        }else{
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

    // 监测配置文件变化
    function watchConfig(project, cacheName) {
        const cwdConfigPath = sysPath.resolve(project.config._config.cwd, project.configFile);

        if (watchCacheNames[cwdConfigPath]) {
            if (watchCacheNames[cwdConfigPath].indexOf(cacheName) === -1) {
                watchCacheNames[cwdConfigPath].push(cacheName);
            }
        } else {
            watchCacheNames[cwdConfigPath] = [cacheName];

            fs.watchFile(cwdConfigPath, { interval: 2000 }, () => {
                watchCacheNames[cwdConfigPath].map((cacheName) => {
                    middlewareCache[cacheName] = null;
                });
                UtilFs.deleteFolderRecursive(project.cachePath, true);
            });
        }
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
