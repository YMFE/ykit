'use strict';

let Project = require('../models/Project.js');

let getCommands = exports.getCommands = () => {
    return globby.sync(['*.js'], {
            cwd: YKIT_COMMANDS_PATH
        })
        .map((name) => {
            return {
                name: sysPath.basename(name, '.js'),
                module: require(sysPath.join(YKIT_COMMANDS_PATH, name))
            };
        })
        .filter((command) => !!command.module);
};

let projectCache = {};

let getProject = exports.getProject = (cwd) => {
    if (!projectCache[cwd]) {
        projectCache[cwd] = new Project(cwd);
    }
    return projectCache[cwd];
};
