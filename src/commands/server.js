'use strict';

let connect = require('connect'),
    fs = require('fs'),
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
    optimist.alias('l', 'livereload');
    optimist.describe('l', '自动刷新');
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
        enableLivereload = options.l || options.livereload,
        port = options.p || options.port || 80;

    let isGoingToStartServer = true

    // 检测前置条件
    if(proxy && !requireg.resolve("jerryproxy-ykit")) {
        isGoingToStartServer = false

        var questions = [{
        	type: 'confirm',
        	name: 'isInstallingProxy',
        	message: 'Prxoy plugin not installed yet, wounld you like to install it now?'
        }];

        inquirer.prompt(questions).then((answers) => {
            if(answers.isInstallingProxy) {
                if(!(process.getuid && process.getuid() === 0)){
                    warn('安装权限不足, 请使用sudo执行 ykit server -x')
                    process.exit(1)
                }

                const installCmd = 'npm i jerryproxy-ykit -g --registry https://registry.npm.taobao.org';
                try {
                    log('intalling jerryproxy-ykit ...')
                    log(child_process.execSync(installCmd, {encoding: 'utf8'}));
                } catch (e) {
                    error(e);
                }
            }
        })
    }

    if(enableLivereload) {
        try {
            require.resolve("livereload")
        } catch(e) {
            var questions = [{
            	type: 'confirm',
            	name: 'isGoingtoInstall',
            	message: 'Livereload plugin not installed yet, wounld you like to install it now?'
            }];

            inquirer.prompt(questions).then((answers) => {
                if(answers.isGoingtoInstall) {
                    if(!(process.getuid && process.getuid() === 0)){
                        warn('安装权限不足, 请使用sudo执行 ykit server -l')
                        process.exit(1)
                    }

                    const installCmd = 'npm i connect-livereload@0.5.4 livereload@0.4.1 --registry https://registry.npm.taobao.org';
                    try {
                        log('intalling connect-livereload & livereload ...')
                        log(child_process.execSync(installCmd, {cwd: sysPath.resolve(__dirname, '../../'), encoding: 'utf8'}));
                    } catch (e) {
                        error(e);
                    }
                }
            })

            isGoingToStartServer = false
        }
    }

    if(isGoingToStartServer) {
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
                    let urlNoVer = req.url.replace(/@[\d\w]+(?=\.\w+$)/, '')
                    urlNoVer = urlNoVer[0] === '/' ? urlNoVer.slice(1) : urlNoVer

                    // 从编译cache中取，map文件不必生成重复middleware
                    const cacheId = sysPath.join(projectName, urlNoVer.replace('.map', ''))
                    let middleware = middlewareCache[cacheId]

                    if (!middleware) {
                        let project = Manager.getProject(projectCwd, {cache: false});

                        if (project.check()) {
                            compiler = project.getServerCompiler(function(config) {
                                let nextConfig = extend({}, config)
                                Object.keys(config.entry).map((entryKey) => {
                                    const entryItem = config.entry[entryKey]

                                    let isRequestingEntry = false,
                                        entryPath = ''

                                    if(Array.isArray(entryItem)) {
                                        entryPath = entryItem[entryItem.length - 1]
                                    } else {
                                        entryPath = entryItem
                                    }

                                    const cssReg = new RegExp(config.entryExtNames.css.join('|'))
                                    entryPath = entryPath.replace(cssReg, '.css') // 将入口的.scss/.less后缀替换为.css
                                    isRequestingEntry = entryPath.indexOf(urlNoVer) > -1

                                    if(isRequestingEntry) {
                                        nextConfig.entry = {
                                            [entryKey]: entryItem
                                        }
                                    }
                                })
                                return nextConfig
                            });

                            compiler.watch({}, function(err, stats) {
                                // compiler complete
                                middleware = middlewareCache[cacheId] = webpackDevMiddleware(compiler, {quiet: true,});
                                middleware(req, res, next);
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
                        compilerPromise = promiseCache[projectName];

                    if (!middleware && !creatingCompiler) {
                        let project = Manager.getProject(projectCwd, {cache: false}),
                            resolve,
                            reject;

                        creatingCompiler = true
                        compilerPromise = promiseCache[projectName] = new Promise((res, rej) => { resolve = res; reject = rej; });

                        if (project.check()) {
                            compiler = project.getServerCompiler(function(config) {
                                return config
                            });

                            compiler.watch({}, function(err, stats) {
                                // compiler complete
                                middleware = middlewareCache[projectName] = webpackDevMiddleware(compiler, {quiet: true});

                                // 输出server运行中 error/warning 信息
                                creatingCompiler = false
                                middleware(req, res, next);
                                resolve(middleware);
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

        if(enableLivereload){
            const livereload = require('livereload');
            const connectLivereload = require('connect-livereload');

            livereload.createServer().watch(cwd);
            app.use(connectLivereload({port: 35729}));
        }

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
            warn('Listening on port ' + port);
        })

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
    }
};
