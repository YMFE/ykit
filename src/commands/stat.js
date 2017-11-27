'use strict';

const shell = require('shelljs');
const packCMD = require('./pack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

exports.usage = '分析项目 bundle';

exports.setOptions = () => {

};

exports.run = function(options) {
	console.log('stat!');
	let config = this.project.config.getConfig();
	config.plugins.push(new BundleAnalyzerPlugin(options || {}));

	packCMD.run.bind(this)({})
};
