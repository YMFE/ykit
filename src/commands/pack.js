'use strict';

exports.usage = '资源编译、打包';
exports.abbr = 'p';

exports.setOptions = (optimist) => {
    optimist.alias('l', 'lint');
    optimist.describe('l', '先进行验证');
    optimist.alias('m', 'min');
    optimist.describe('m', '压缩/混淆项目文件');
    optimist.alias('s', 'sourcemap');
    optimist.describe('s', '使用sourcemap');
    optimist.alias('g', 'group');
    optimist.describe('g', 'exports 分组');
    optimist.alias('c', 'clean');
    optimist.describe('c', '打包前清空输出目录');
    optimist.alias('q', 'quiet');
    optimist.describe('q', '静默模式');
};

exports.run = function (options) {
    let min = options.m || options.min || false,
        lint = options.l || options.lint || false,
        clean = options.c || options.clean || false,
        quiet = options.q || options.quiet || false,
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
        sourcemap: sourcemap,
        clean: clean,
        quiet: quiet
    }, (err) => {
        if (err) {
            if (err !== true) {
                error(err);
            }
        }
    });
};
