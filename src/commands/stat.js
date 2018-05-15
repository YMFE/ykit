'use strict';

const shell = require('shelljs');
const packCMD = require('./pack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

exports.usage = '打包结果分析';
exports.abbr = 'st';

exports.setOptions = () => {
	optimist.alias('f', 'file');
	optimist.describe('file', '资源分析文件路径，默认为 ./stat.json');
};

exports.run = function(options) {
	const file = options.f || options.file;
	const config = this.project.config.getConfig();

	config.plugins.push(new BundleAnalyzerPlugin(
		file ? {
			analyzerMode: 'static',
			generateStatsFile: true,
			reportFilename: 'report.html'
		} : {}
	));

	packCMD.run.bind(this)({
		quiet: true,
		sourcemap: 'none'
	});
};
