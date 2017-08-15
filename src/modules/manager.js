'use strict';


// Project
let Project = require('../models/Project.js');
let projectCache = {};

exports.getProject = (cwd, options) => {
    if (!projectCache[cwd] || !options.cache) {
        projectCache[cwd] = new Project(cwd);
    }
    return projectCache[cwd];
};

// Command
exports.getCommands = () => {
    return globby.sync(['*.js'], {
        cwd: YKIT_COMMANDS_PATH
    }).map((name) => {
        return {
            name: sysPath.basename(name, '.js'),
            abbr: require(sysPath.join(YKIT_COMMANDS_PATH, name)).abbr,
            module: require(sysPath.join(YKIT_COMMANDS_PATH, name))
        };
    }).concat((readRC().commands || []).map((item) => {
        return {
            name: item.name,
            module: require(item.path)
        };
    })).filter((command) => !!command.module);
};

// ykitrc
let readRC = exports.readRC = () => {
    try {
        return JSON5.parse(fs.readFileSync(YKIT_RC, 'UTF-8'));
    } catch (e) {
        // warn('读取 .ykitrc 失败！');
    }
    return {};
};

exports.writeRC = (rc) => {
    fs.writeFileSync(YKIT_RC, JSON.stringify(rc, {}, 4), 'UTF-8');
};

let ykitConfig = {};

exports.mixYkitConf = (options) => {
    extend(true, ykitConfig, options);
};

exports.getYkitConf = (name) => {
    return ykitConfig[name];
};
