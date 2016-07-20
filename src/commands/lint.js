'use strict'

let Manager = require('../modules/manager.js');

exports.usage = "代码质量检测";

exports.setOptions = (optimist) => {};

exports.run = function (options)  {

    let cwd = options.cwd,
        min = options.m || options.min,
        project = this.project;

    async.series([
        (callback) => project.lint(callback),
        (callback) => project.lintCss(callback)
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
