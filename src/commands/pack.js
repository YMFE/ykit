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
    optimist.alias('g', 'group');
    optimist.describe('g', 'exports 分组');
};

exports.run = function (options) {
    let cwd = options.cwd,
        min = options.m || options.min || false,
        lint = options.l || options.lint || false,
        group = options.g || options.group,
        sourcemap = options.s || options.sourcemap,
        project = this.project;

    if (typeof group == 'string') {
        if (project.config._config.entryGroup[group]) {
            project.config._config.entry = {};
            project.config.setExports(project.config._config.entryGroup[group]);
        } else {
            error('找不到 Exports 分组:', group);
        }
    }

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

        project.packCallbacks.forEach(cb => cb(options, stats));
    });
};
