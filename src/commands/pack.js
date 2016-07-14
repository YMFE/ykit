'use strict';

let Manager = require('../modules/manager.js');

exports.usage = "资源编译、打包";

exports.setOptions = (optimist) => {
    optimist.alias('l', 'lint');
    optimist.describe('l', '先进行验证');
    optimist.alias('m', 'min');
    optimist.describe('m', '压缩/混淆项目文件');
    optimist.alias('s', 'sourcemap');
    optimist.describe('s', '使用sourcemap');
};

exports.run = (options) => {
    let cwd = options.cwd,
        min = options.m || options.min || false,
        lint = options.l || options.lint || false,
        sourcemap = options.s || options.sourcemap,
        project = Manager.getProject(cwd);

    project.pack({
        lint: lint,
        min: min,
        sourcemap: sourcemap
    }, (err, stats) => {
        if (err) {
            if (err !== true) {
                error(err);
            }
        }
    });
};
