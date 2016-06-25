'use strict';

let Project = require('../models/Project.js');

exports.usage = "资源编译、打包";

exports.setOptions = (optimist) => {
    optimist.alias('m', 'min');
    optimist.describe('m', '压缩/混淆项目文件');
};

exports.run = (options) => {
	var cwd = options.cwd,
        min = options.m || options.min,
        project = new Project(cwd);

    project.readConfig({
        min: min
    }).pack((err, stats) => {
        // console.log(err, stats);
    });
};
