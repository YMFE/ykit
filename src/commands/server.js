'use strict';

let connect = require('connect'),
    http = require('http'),
    webpackDevMiddleware = require("webpack-dev-middleware");

let Project = require('../models/Project.js');

exports.usage = "开发服务";

exports.setOptions = (optimist) => {
    optimist.alias('h', 'hot');
	optimist.describe('h', '热加载');
    optimist.alias('s', 'https');
	optimist.describe('s', '使用https协议');
    optimist.alias('p', 'port');
	optimist.describe('p', '端口');
};

exports.run = (options) => {
	let app = connect(),
        cwd = options.cwd,
        hot = options.h || options.hot,
        https = options.s || options.https,
        port = options.p || options.port;

    // app.use(webpackDevMiddleware(new Project(cwd).readConfig().getCompiler()));

    // http.createServer(app).listen(3000);
};
