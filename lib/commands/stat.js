'use strict';

var shell = require('shelljs');
var packCMD = require('./pack');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

exports.usage = '打包结果分析';
exports.abbr = 'st';

exports.setOptions = function () {
	optimist.alias('f', 'file');
	optimist.describe('file', '资源分析文件路径，默认为 ./stat.json');
};

exports.run = function (options) {
	var file = options.f || options.file;
	var config = this.project.config.getConfig();

	config.plugins.push(new BundleAnalyzerPlugin(file ? {
		analyzerMode: 'static',
		generateStatsFile: true,
		reportFilename: 'report.html'
	} : {}));

	packCMD.run.bind(this)({
		quiet: true,
		sourcemap: 'none'
	});
};