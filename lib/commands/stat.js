'use strict';

var shell = require('shelljs');
var packCMD = require('./pack');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

exports.usage = '打包结果分析';
exports.abbr = 'st';

exports.setOptions = function () {};

exports.run = function (options) {
	var config = this.project.config.getConfig();
	config.plugins.push(new BundleAnalyzerPlugin(options || {}));

	packCMD.run.bind(this)({
		quiet: true,
		sourcemap: 'none'
	});
};