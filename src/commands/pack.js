'use strict';

let Project = require('../models/Project.js');

exports.usage = "资源编译、打包";

exports.setOptions = (optimist) => {
    optimist.alias('l', 'lint');
    optimist.describe('l', '先进行验证');
    optimist.alias('m', 'min');
    optimist.describe('m', '压缩/混淆项目文件');
};

exports.run = (options) => {
	var cwd = options.cwd,
        min = options.m || options.min,
        lint = options.l || options.lin,
        project = new Project(cwd);


    project.readConfig({
        min: min
    }).pack({
        lint: lint
    }, (err, stats) => {
        success('Complete');
    });
};
