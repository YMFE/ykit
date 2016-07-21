'use strict'

let Manager = require('../modules/manager.js');

exports.usage = "代码质量检测";

exports.setOptions = (optimist) => {
    optimist.alias('d', 'dir');
    optimist.describe('d', '检测特定目录/文件');
};

exports.run = function (options)  {
    let cwd = options.cwd,
        project = this.project,
        dir = options.d || options.dir;

    async.series([
        (callback) => project.lint(dir, callback),
        (callback) => project.lintCss(dir, callback)
    ], (err, results) => {
        if (!err) {
            if (results[0] && results[1]) {
                success('All files complete without error.');
            }
        } else if (err === true) {
            error('Lint Error！');
        } else {
            error(err);
        }
    });
}
