'use strict';

const connect = require('connect'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    serveStatic = require('serve-static'),
    serveIndex = require('serve-index'),
    moment = require('moment'),
    child_process = require('child_process'),
    requireg = require('requireg'),
    webpackDevMiddleware = require('webpack-dev-middleware');

const Manager = require('../modules/manager.js');
const UtilFs = require('../utils/fs.js');
const UtilPath = require('../utils/path.js');
const EncodingPlugin = require('webpack-encoding-plugin-quiet');

exports.usage = '开发服务';
exports.abbr = 's';

exports.setOptions = (optimist) => {
    optimist.alias('p', 'port');
    optimist.describe('p', '端口');
    optimist.alias('x', 'proxy');
    optimist.describe('x', '开启 proxy 代理服务');
    optimist.alias('v', 'verbose');
    optimist.describe('v', '显示详细编译信息');
    optimist.alias('m', 'middlewares');
    optimist.describe('m', '加载项目中间件');
    optimist.alias('s', 'https');
    optimist.describe('s', '开启 https 服务');
};

exports.run = (options) => {
    let app = connect(),
        cwd = options.cwd,
        verbose = options.v || options.verbose,
        proxy = options.x || options.proxy,
        middlewares = options.m || options.middlewares,
        isHttps = options.s || options.https,
        port = options.p || options.port || 80;

    let middlewareCache = {},
        promiseCache = {},
        watchCacheNames = {};

    if (middlewares) {
        middlewares.split('|').forEach((proName) => {
            let pro = Manager.getProject(sysPath.join(cwd, proName));
            if (pro.check() && Array.isArray(pro.middlewares)) {
                pro.middlewares.forEach((mw) => app.use(mw));
            }
        });
    }

    // 预处理
    app.use((req, res, next) => {
        const extName = sysPath.extname(req.url);

        extName === '.js' && res.setHeader('Content-Type', 'application/javascript');
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

            if(sysPath.extname(req.url) !== '.map') {
                const format = '%date %status %method %url (%route%contentLength%time)';
                const parseResult = parse(req, res, format);
                return process.nextTick(() => {
                    spinner.text = parseResult.message;
                    parseResult.status >= 400 ? spinner.fail() : spinner.succeed();
                    spinner.text = '';
                });
            }
        };

        function parse(req, res, format) {
            const dateFormat = 'YY.MM.DD HH:mm:ss';
            /* eslint-disable */
            const status = (function () {
                switch (true) {
                    case 500 <= res.statusCode:
                        return '\x1b[31m';
                    case 400 <= res.statusCode:
                        return '\x1b[33m';
                    case 300 <= res.statusCode:
                        return '\x1b[36m';
                    case 200 <= res.statusCode:
                        return '\x1b[32m';
                }
            })();
            /* eslint-enable */

            let contentLength = res._contentLength || '';
            if (contentLength) {
                contentLength = contentLength > 1024
                    ? (contentLength / 1024).toFixed(2) + 'KB '
                    : contentLength + 'Bytes ';
            }

            format = format.replace(/%date/g, '\x1b[90m' + '[' + (moment().format(dateFormat)) + ']' + '\x1b[0m');
            format = format.replace(/%method/g, '\x1b[35m' + (req.method.toUpperCase()) + '\x1b[0m');
            format = format.replace(/%url/g, decodeURI(req.originalUrl));
            format = format.replace(/%status/g, '' + status + res.statusCode + '\x1b[0m');
            format = format.replace(/%route/g, '\x1b[90m' + (req.route ? req.route.path + ' ' : '\x1b[31m') + '\x1b[0m');
            format = format.replace(/%contentLength/g, '\x1b[90m' + contentLength + '\x1b[31m' + '\x1b[0m');
            format = format.replace(/%(date|time)/g, '\x1b[90m' + (new Date - req._startTime) + 'ms\x1b[0m');

            return {
                message: format,
                status: res.statusCode
            };
        }

        return next();
    });

    app.use(function (req, res, next) {
        try {
            const projectInfo = getProjectInfo(req);
            const project = Manager.getProject(projectInfo.projectCwd, { cache: false });
            const customMiddlewares = project.config.getMiddlewares();
            const _next = () => {
                if (customMiddlewares.length === 0) {
                    next();
                } else {
                    const nextMw = customMiddlewares.shift();
                    nextMw(req, res, _next);
                }
            };

            _next();
        } catch (e) {
            next();
        }
    });

    // compiler
    app.use(function (req, res, next) {
        let url = req.url,
            keys = url.split('/'),
            compiler = null;

        const projectInfo = getProjectInfo(req);
        const projectName = projectInfo.projectName;
        const projectCwd = projectInfo.projectCwd;
        const project = Manager.getProject(projectCwd, { cache: false });
        const outputDir = project.config._config.output.local.path || 'prd';

        // 非 output.path 下的资源不做处理
        if(keys[2] !== sysPath.relative(projectCwd, outputDir)) {
            next();
            return;
        }

        // 清除 YKIT_CACHE_DIR 资源
        let isFirstCompileDir = true;
        Object.keys(middlewareCache).map((cacheName) => {
            if(cacheName.startsWith(projectName)) {
                isFirstCompileDir = false;
            }
        });
        if(isFirstCompileDir) {
            UtilFs.deleteFolderRecursive(sysPath.join(projectCwd, YKIT_CACHE_DIR), true);
        }

        // 处理资源路径, 去掉 query & 版本号
        const rquery = /\?.+$/;
        const rversion = /@[\d\w]+(?=\.\w+)/;
        req.url = '/' + keys.slice(3).join('/').replace(rversion, '').replace(rquery, '');

        // 生成 cacheId
        const requestUrl = req.url.replace('.map', '').slice(1);
        const cacheId = sysPath.join(projectName, requestUrl);

        // 寻找已有的 middlewareCache
        if(middlewareCache[cacheId]) {
            middlewareCache[cacheId](req, res, next);
            return;
        }

        let nextConfig;
        compiler = project.getServerCompiler(function (config) {
            nextConfig = extend({}, config);

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
                    const replaceReg =  new RegExp('\\' + exts.join('|\\'));

                    entryPath = UtilPath.normalize(entryPath.replace(replaceReg, '.' + targetExtName));
                });

                // 如果是 ykit 处理过的样式文件，将其变为正常的请求路径(../.ykit_cache/main/index.css => main/index.css)
                if (entryPath.indexOf('.css.js') && entryPath.indexOf('.ykit_cache/') > 1) {
                    entryPath = entryPath.split('.ykit_cache/')[1];
                }

                // 判断所请求的资源是否在入口配置中
                const matchingPath = sysPath.normalize(entryPath) === sysPath.normalize(requestUrl);
                const matchingKey = sysPath.normalize(requestUrl) === entryKey + sysPath.extname(requestUrl);

                if (matchingPath || matchingKey) {
                    isRequestingEntry = true;
                }

                if (isRequestingEntry) {
                    nextConfig.entry = {
                        [entryKey]: entryItem
                    };
                }
            });

            nextConfig.plugins.push(require('../plugins/progressBarPlugin.js'));
            nextConfig.plugins.push(require('../plugins/compileInfoPlugin.js'));
            nextConfig.plugins.push(new EncodingPlugin({encoding: 'utf-8'}));

            return nextConfig;
        });

        // 如果没找到该资源，在整个编译过程结束后再返回
        if (Object.keys(nextConfig.entry).length === 0) {
            setTimeout(() => {
                if (promiseCache[projectName]) {
                    Promise.all(promiseCache[projectName]).then(function () {
                        next();
                    });
                } else {
                    res.statusCode = 404;
                    res.end('[ykit] - js入口未找到，请检查项目' + projectName + '的ykit配置文件.');
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

            const middleware = middlewareCache[cacheId] = webpackDevMiddleware(compiler,
                {
                    quiet: true, reporter: ({state, stats}) => {
                        Object.keys(stats.compilation.assets).map((key) => {
                            const keyCacheId = sysPath.join(projectName, key);
                            middlewareCache[keyCacheId] = middleware;

                            if(verbose) {
                                log('emitted asset:', stats.compilation.assets[key].existsAt);
                            }
                        });

                        resolve();
                    }
                }
            );
            middleware(req, res, next);
        }

        // 检测config文件变化
        watchConfig(project, cacheId);
    });

    app.use(serveStatic(cwd, {
        redirect: false,
        index: false
    }));

    app.use(serveIndex(cwd));

    // 启动 http server 和 https server(如果有)
    let servers = [];
    servers.push(extend(http.createServer(app), { _port: port }));
    if (isHttps) {
        const globalConfig = JSON.parse(fs.readFileSync(YKIT_RC, { encoding: 'utf8' }));

        if (!globalConfig['https-key'] || !globalConfig['https-crt']) {
            warn('缺少 https 证书/秘钥配置，将使用默认，或执行以下命令设置:');
            !globalConfig['https-key'] && warn('ykit config set https-key <path-to-your-key>');
            !globalConfig['https-crt'] && warn('ykit config set https-crt <path-to-your-crt>');
        }

        const defaultHttpsConfigPath = sysPath.join(__dirname, '../config/https/');
        const httpsOpts = {
            key: fs.readFileSync(globalConfig['https-key'] || defaultHttpsConfigPath + 'server.key'),
            cert: fs.readFileSync(globalConfig['https-crt'] || defaultHttpsConfigPath + 'server.crt')
        };
        servers.push(extend(https.createServer(httpsOpts, app), { _port: '443', _isHttps: true }));
    }

    servers.forEach((server) => {
        server.on('error', (e) => {
            if (e.code === 'EACCES') {
                warn('权限不足, 请使用sudo/管理员模式执行');
            } else if (e.code === 'EADDRINUSE') {
                warn('端口 ' + server._port + ' 已经被占用, 请关闭占用该端口的程序或者使用其它端口.');
            }
            process.exit(1);
        });
        server.listen(server._port, () => {
            const serverUrl = (server._isHttps ? 'https' : 'http')
                + '://127.0.0.1:'
                + server._port;

            !server._isHttps && log('Starting up server, serving at: ' + options.cwd);
            log('Available on: ' + serverUrl.underline);
        });
    });

    // 代理
    var proxyProcess;
    if (proxy) {
        const proxyPath = sysPath.join(requireg.resolve('jerryproxy'), '../bin/jerry.js');
        proxyProcess = child_process.fork(proxyPath);
    }

    // 权限降级
    if (process.env['SUDO_UID']) {
        process.setuid(parseInt(process.env['SUDO_UID']));
    }

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
