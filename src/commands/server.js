'use strict';

let connect = require('connect'),
    fs = require('fs'),
    os = require('os'),
    http = require('http'),
    https = require('https'),
    serveStatic = require('serve-static'),
    serveIndex = require('serve-index'),
    moment = require('moment'),
    child_process = require('child_process'),
    inquirer = require('inquirer'),
    requireg = require('requireg'),
    webpackDevMiddleware = require("webpack-dev-middleware");

let Manager = require('../modules/manager.js');
let UtilFs = require('../utils/fs.js');

exports.usage = "开发服务";

exports.setOptions = (optimist) => {
    optimist.alias('p', 'port');
    optimist.describe('p', '端口');
    optimist.alias('x', 'proxy');
    optimist.describe('x', '启用proxy代理服务');
    optimist.alias('m', 'middlewares');
    optimist.describe('m', '加载项目中间件');
    optimist.alias('a', 'all');
    optimist.describe('a', '整体编译');
    optimist.alias('s', 'https');
    optimist.describe('s', '使用https协议');
};

exports.run = (options) => {
    let app = connect(),
        cwd = options.cwd,
        hot = options.h || options.hot,
        proxy = options.x || options.proxy,
        middlewares = options.m || options.middlewares,
        isHttps = options.s || options.https,
        isCompilingAll = options.a || options.all,
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
        })
    }

    // logger
    app.use((req, res, next) => {
        const end = res.end;
    	req._startTime = new Date;

    	res.end = (chunk, encoding) => {
    		res.end = end;
    		res.end(chunk, encoding);
            const format = '%date %status %method %url (%route%contentLength%time)'
    		const message = parse(req, res, format);
    		return process.nextTick(() => {
    			return info(message);
    		});
    	};

        function parse(req, res, format) {
            const dateFormat = 'YY.MM.DD HH:mm:ss';
            const status = (function() {
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

            let contentLength = res._contentLength || '';
            if(contentLength){
                contentLength = contentLength > 1024
                                ? (contentLength / 1024).toFixed(2) + 'kB '
                                : contentLength + 'bytes ';
            }

        	format = format.replace(/%date/g, "\x1b[90m" + '[' + (moment().format(dateFormat)) + ']' + "\x1b[0m");
        	format = format.replace(/%method/g, "\x1b[35m" + (req.method.toUpperCase()) + "\x1b[0m");
        	format = format.replace(/%url/g, "\x1b[90m" + decodeURI(req.originalUrl) + "\x1b[0m");
        	format = format.replace(/%status/g, "" + status + res.statusCode + "\x1b[0m");
            format = format.replace(/%route/g, "\x1b[90m" + (req.route ? req.route.path + ' ' : '\x1b[31m') + "\x1b[0m");
        	format = format.replace(/%contentLength/g, "\x1b[90m" + contentLength + '\x1b[31m' + "\x1b[0m");
        	format = format.replace(/%(date|time)/g, "\x1b[90m" + (new Date - req._startTime) + "ms\x1b[0m");
        	return format;
        };

    	return next();
    });

    // compiler
    let creatingCompiler = false
    app.use(function(req, res, next) {
        let url = req.url,
            keys = url.split('/'),
            compiler = null,
            projectName = keys[1],
            projectCwd = sysPath.join(cwd, projectName);

        // 处理prd资源
        if(keys[2] === 'prd') {
            req.url = '/' + keys.slice(3).join('/').replace(/(\@[\d\w]+)?\.(js|css)/, '.$2');

            // 只编译所请求的资源
            if(!isCompilingAll) {
                // 去掉版本号和打头的"/"
                let pureSourcePath = req.url.replace(/@[\d\w]+(?=\.\w+$)/, '')
                pureSourcePath = pureSourcePath[0] === '/' ? pureSourcePath.slice(1) : pureSourcePath

                // 去掉url query
                pureSourcePath = pureSourcePath.replace(/\?[\w=&]+$/, '')

                // 从编译cache中取，map文件不必生成重复middleware
                const cacheId = sysPath.join(projectName, pureSourcePath.replace('.map', ''))
                let middleware = middlewareCache[cacheId]

                if (!middleware) {
                    let project = Manager.getProject(projectCwd, {cache: false});

                    if (project.check()) {
                        compiler = project.getServerCompiler(function(config) {
                            let nextConfig = extend({}, config)

                            // 将webpack entry设置为当前请求的资源
                            Object.keys(config.entry).map((entryKey) => {
                                const entryItem = config.entry[entryKey]

                                let isRequestingEntry = false,
                                    entryPath = ''

                                if(Array.isArray(entryItem)) {
                                    entryPath = entryItem[entryItem.length - 1]
                                } else {
                                    entryPath = entryItem
                                }

                                const cssReg = new RegExp('\\' + config.entryExtNames.css.join('|\\'))
                                entryPath = entryPath.replace(cssReg, '.css') // 将入口的.scss/.less后缀替换为.css
                                isRequestingEntry = entryPath.indexOf(pureSourcePath) > -1

                                if(isRequestingEntry) {
                                    nextConfig.entry = {
                                        [entryKey]: entryItem
                                    }
                                }
                            })

                            nextConfig.plugins.push(require('../plugins/progressBarPlugin.js'))
                            nextConfig.plugins.push(require('../plugins/compileInfoPlugin.js'))

                            return nextConfig
                        });

                        compiler.watch({}, function(err, stats) {
                            // compiler complete
                            if(!middlewareCache[cacheId]) {
                                middleware = middlewareCache[cacheId] = webpackDevMiddleware(compiler, {quiet: true});
                                middleware(req, res, next);
                            } else {
                                next()
                            }
                        });
                        // 检测config文件变化
                        watchConfig(project, middleware, cacheId)
                    } else {
                        next()
                    }
                } else {
                    middleware(req, res, next)
                }
            } else { // 一次编译全部资源
                let middleware = middlewareCache[projectName],
                    compilerPromise = promiseCache[projectName],
                    project = Manager.getProject(projectCwd, {cache: false})

                // 如果entry发生变化，则需要进行重新编译
                const nextEntry = extend({}, project.config._config.entry)
                if(compilerPromise && compilerPromise.entry) {
                    const prevEntry = compilerPromise.entry

                    const isEntryChanged = !Object.keys(nextEntry).every((item) => {
                        prevEntry[item] = Array.isArray(prevEntry[item]) ? prevEntry[item][prevEntry[item].length - 1] : prevEntry[item]
                        nextEntry[item] = Array.isArray(nextEntry[item]) ? nextEntry[item][nextEntry[item].length - 1] : nextEntry[item]
                        return prevEntry[item] && prevEntry[item] === nextEntry[item]
                    })

                    if(isEntryChanged) {
                        middleware = null // 重新编译
                        UtilFs.deleteFolderRecursive(project.cachePath, true)
                    }
                }

                if (!middleware && !creatingCompiler) {
                    let resolve, reject;

                    creatingCompiler = true
                    compilerPromise = promiseCache[projectName] = new Promise((res, rej) => { resolve = res; reject = rej; });

                    // 把当前entry挂在promiseCache上，在以后rebuild时比对entry，决定是否需要重新编译
                    promiseCache[projectName].entry = extend({}, nextEntry)

                    if (project.check()) {
                        compiler = project.getServerCompiler(function(config) {
                            config.plugins.push(require('../plugins/progressBarPlugin.js'))
                            return config
                        });

                        compiler.watch({}, function(err, stats) {

                            // compiler complete
                            if(!middlewareCache[projectName]) {
                                middleware = middlewareCache[projectName] = webpackDevMiddleware(compiler, {quiet: true});

                                // 输出server运行中 error/warning 信息
                                creatingCompiler = false
                                middleware(req, res, next);
                                resolve(middleware);
                            } else {
                                next()
                            }
                        });

                        // 检测config文件变化
                        watchConfig(project, middleware, projectName)
                    } else {
                        next()
                    }
                } else {
                    if(compilerPromise) {
                        compilerPromise.then((middleware) => {
                            middleware(req, res, next)
                        });
                    } else {
                        next()
                    }
                }
            }
        } else { // 非prd资源不做处理
            next()
        }
    });

    app.use(serveStatic(cwd, {
        redirect: false,
        index: false
    }));

    app.use(serveIndex(cwd));

    let server

    if(!isHttps) {
        server = http.createServer(app)
    } else {
        const httpsOpts = {
            key : fs.readFileSync(sysPath.join(__dirname, '../config/https/server.key')),
            cert : fs.readFileSync(sysPath.join(__dirname, '../config/https/server.crt'))
        }
        server = https.createServer(httpsOpts, app)
    }

    server.on('error', (e) => {
        if(e.code === 'EACCES'){
            warn('权限不足, 请使用sudo执行')
        } else if(e.code === 'EADDRINUSE'){
            warn('端口 ' + port + ' 已经被占用, 请关闭占用该端口的程序或者使用其它端口.')
        }
        process.exit(1)
    })
    server.listen(port, () => {

        info(['Starting up server, serving at',
          options.cwd,
          '\nAvailable on:'
        ].join(''));

        let networkInterfaces = os.networkInterfaces();
        let protocol = options.https ? 'https://' : 'http://';
        Object.keys(networkInterfaces).forEach(function (dev) {
            networkInterfaces[dev].forEach(function (details) {
                if (details.family === 'IPv4') {
                    info('  ' + protocol + details.address + ':' + port);
                }
            });
        });
    });

    // 代理
    if(proxy) {
        const proxyPath = sysPath.join(requireg.resolve('jerryproxy-ykit'), '../bin/jerry.js')
        child_process.fork(proxyPath);
    }

    // 权限降级
    if (process.env['SUDO_UID']) {
        process.setuid(parseInt(process.env['SUDO_UID']));
    }

    // 监测配置文件变化
    function watchConfig(project, middleware, cacheName) {
        const cwdConfigPath = sysPath.resolve(project.config._config.cwd, project.configFile)

        if(watchCacheNames[cwdConfigPath]) {
            if(watchCacheNames[cwdConfigPath].indexOf(cacheName) === -1) {
                watchCacheNames[cwdConfigPath].push(cacheName)
            }
        } else {
            watchCacheNames[cwdConfigPath] = [cacheName]

            fs.watchFile(cwdConfigPath, {interval: 2000}, () => {
                watchCacheNames[cwdConfigPath].map((cacheName) => {
                    middlewareCache[cacheName] = null
                })
                UtilFs.deleteFolderRecursive(project.cachePath, true)
            });
        }
    }
};
