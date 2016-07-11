'use strict'

let Project = require('../models/Project.js');

exports.usage = "代码质量检测";

exports.setOptions = (optimist) => {};

exports.run = (options) => {

    let cwd = options.cwd,
        min = options.m || options.min,
        project = new Project(cwd);

    project.readConfig()
    warn('Lint JS Files:')
    if (project.lint()) {
        success('All JS Complete!');
        info();
    }
    warn('Lint CSS Files:')
    if (project.lintCss()) {
        info();
        success('All CSS Complete!');
        info();
    }
}
