'use strict'

let Project = require('../models/Project.js');

exports.usage = "代码质量检测";

exports.setOptions = (optimist) => {};

exports.run = (options) => {

    let cwd = options.cwd,
        min = options.m || options.min,
        project = new Project(cwd);

    async.series([
        (callback) => project.lint(callback),
        (callback) => project.lintCss(callback)
    ], (err, results) => {
        if (!err) {
            if (results[0] && results[1]) {
                success('All Files Complete!');
            }
        } else {
            error(err.stack);
        }
    });
}
