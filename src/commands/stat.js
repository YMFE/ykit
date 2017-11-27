'use strict';

const shell = require('shelljs');
const packCMD = require('./pack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

exports.usage = '打包结果分析';

exports.setOptions = () => {

};

exports.run = function(options) {
	let config = this.project.config.getConfig();
	config.plugins.push(new BundleAnalyzerPlugin(options || {}));

	packCMD.run.bind(this)({
		quiet: true,
		sourcemap: false
	});
};
