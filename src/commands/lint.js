'use strict'

let Project = require('../models/Project.js');

exports.usage = "代码质量检测";

exports.setOptions = (optimist) => {};

exports.run = (options) => {

    var cwd = options.cwd,
        min = options.m || options.min,
        project = new Project(cwd);


    project.readConfig().lint(() => {
        success('Complete');
    });
}
