'use strict';

// Project

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Project = require('../models/Project.js');
var projectCache = {};

exports.getProject = function (cwd, options) {
    if (!projectCache[cwd] || !options.cache) {
        projectCache[cwd] = new Project(cwd);
    }
    return projectCache[cwd];
};

// Command
exports.getCommands = function () {

    return globby.sync(['*.js'], {
        cwd: YKIT_COMMANDS_PATH
    }).map(function (name) {
        console.log('name-----', YKIT_COMMANDS_PATH);
        return {
            name: sysPath.basename(name, '.js'),
            abbr: require(sysPath.join(YKIT_COMMANDS_PATH, name)).abbr,
            module: require(sysPath.join(YKIT_COMMANDS_PATH, name))
        };
    }).concat((readRC().commands || []).map(function (item) {
        return {
            name: item.name,
            module: require(item.path)
        };
    })).filter(function (command) {
        return !!command.module;
    });
};

// ykitrc
var readRC = exports.readRC = function () {
    try {
        return JSON5.parse(fs.readFileSync(YKIT_RC, 'UTF-8'));
    } catch (e) {
        // warn('读取 .ykitrc 失败！');
    }
    return {};
};

exports.writeRC = function (rc) {
    fs.writeFileSync(YKIT_RC, (0, _stringify2.default)(rc, {}, 4), 'UTF-8');
};

var ykitConfig = {};

exports.mixYkitConf = function (options) {
    extend(true, ykitConfig, options);
};

exports.getYkitConf = function (name) {
    return ykitConfig[name];
};