'use strict';

var shell = require('shelljs');
var packCMD = require('./pack');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

exports.usage = '分析项目 bundle';

exports.setOptions = function () {};

exports.run = function (options) {
	console.log('stat!');
	var config = this.project.config.getConfig();
	config.plugins.push(new BundleAnalyzerPlugin(options || {}));

	packCMD.run.bind(this)({});
};