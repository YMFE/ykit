'use strict';

let Project = require('../models/Project.js');

let loadModule = exports.loadModule = (path) => {
    var pkg = require(sysPath.join(path, 'package.json'));
    return pkg.main ? require(sysPath.join(path, pkg.main)) : null;
};

let getModule = exports.getModule = (type, name) => {
    if (type) {
        let prefix = '-' + type + '-';
        if (name) {
            let list = YKIT_PROJECT_MODULES.filter((name) => name.indexOf(prefix + name) > -1);
            if (list.length == 0) {
                list = YKIT_GLOBAL_MODULES.filter((name) => name.indexOf(prefix + name) > -1);
            }
            if (list[0]) {
                return loadModule(list[0]);
            }
        } else {
            return YKIT_PROJECT_MODULES.concat(YKIT_GLOBAL_MODULES)
                .filter((name) => name.indexOf(prefix) > -1)
                .map((name) => {
                    return {
                        name: name.split(prefix)[1],
                        module: loadModule(name)
                    };
                });
        }
    }
    return null;
};

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
        .concat(getModule('command'))
        .filter((command) => !!command.module);
};

let projectCache = {};

let getProject = exports.getProject = (cwd) => {
    if (!projectCache[cwd]) {
        projectCache[cwd] = new Project(cwd);
    }
    return projectCache[cwd];
};
