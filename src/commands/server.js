'use strict';

let connect = require('connect'),
    http = require('http'),
    serveStatic = require('serve-static'),
    serveIndex = require('serve-index'),
    webpackDevMiddleware = require("webpack-dev-middleware");

let Manager = require('../modules/manager.js');

exports.usage = "开发服务";

exports.setOptions = (optimist) => {
    optimist.alias('h', 'hot');
    optimist.describe('h', '热加载');
    optimist.alias('s', 'https');
    optimist.describe('s', '使用https协议');
    optimist.alias('p', 'port');
    optimist.describe('p', '端口');
    optimist.alias('m', 'middlewares');
    optimist.describe('m', '加载项目中间件')
};

exports.run = (options) => {
    let app = connect(),
        cwd = options.cwd,
        hot = options.h || options.hot,
        middlewares = options.m || options.middlewares,
        https = options.s || options.https,
        port = options.p || options.port || 80;

    let middlewareCache = {};

    if (middlewares) {
        middlewares.split('|').forEach((proName) => {
            let pro = Manager.getProject(sysPath.join(cwd, proName)).readConfig({
                noCheck: true,
                server: true
            });
            if (pro.check() && Array.isArray(pro.middlewares)) {
                pro.middlewares.forEach((mw) => app.use(mw));
            }
        })
    }

    app.use(function(req, res, next) {
        let url = req.url,
            keys = url.split('/');

        if (keys[2] == 'prd') {
            let projectName = keys[1],
                projectCwd = sysPath.join(cwd, projectName),
                middleware = middlewareCache[projectName];

            if (!middleware) {
                let project = Manager.getProject(projectCwd).readConfig({
                    server: true
                });
                if (project.check()) {
                    let compiler = project.getCompiler();
                    middleware = middlewareCache[projectName] = webpackDevMiddleware(compiler, {
                        hot: hot
                    });
                    // console.log('------');
                    // setInterval(function() {
                    //     console.log(compiler.outputFileSystem.readdirSync('cache'));
                    // }, 1000);
                } else {
                    next();
                    return;
                }

            }
            req.url = '/' + keys.slice(3).join('/').replace(/(\@[\d\w]+)?\.(js|css)/, '.$2');
            middleware(req, res, next);
        } else {
            next();
        }
    });

    app.use(serveStatic(cwd, {
        redirect: false,
        index: false
    }));

    app.use(serveIndex(cwd));

    http.createServer(app).listen(port);
};
