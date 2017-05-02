'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Project = require('../models/Project.js'),
    ykitModuleReg = /^(@[^\/]+\/)?(ykit\-(\w+)\-[\w\-]+)$/,
    loadYAMLConfigFile = function loadYAMLConfigFile(filePath) {
    try {
        return yaml.safeLoad(fs.readFileSync(filePath, 'UTF-8')) || {};
    } catch (e) {
        e.message = 'Cannot read config file: ' + filePath + '\nError: ' + e.message;
        throw e;
    }
},
    loadJSONConfigFile = function loadJSONConfigFile(filePath) {
    try {
        return JSON5.parse(fs.readFileSync(filePath, 'UTF-8'));
    } catch (e) {
        e.message = 'Cannot read config file: ' + filePath + '\nError: ' + e.message;
        throw e;
    }
},
    loadLegacyConfigFile = function loadLegacyConfigFile(filePath) {
    try {
        return yaml.safeLoad(fs.readFileSync(filePath, 'UTF-8')) || {};
    } catch (e) {
        e.message = 'Cannot read config file: ' + filePath + '\nError: ' + e.message;
        throw e;
    }
},
    loadJSConfigFile = function loadJSConfigFile(filePath) {
    try {
        return requireUncached(filePath);
    } catch (e) {
        e.message = 'Cannot read config file: ' + filePath + '\nError: ' + e.message;
        throw e;
    }
},
    loadPackageJSONConfigFile = function loadPackageJSONConfigFile(filePath) {
    try {
        return loadJSONConfigFile(filePath).eslintConfig || null;
    } catch (e) {
        e.message = 'Cannot read config file: ' + filePath + '\nError: ' + e.message;
        throw e;
    }
},
    loadConfigFile = function loadConfigFile(filePath) {
    // eslint-disable-line
    var config = void 0;

    switch (sysPath.extname(filePath)) {
        case '.js':
            config = loadJSConfigFile(filePath);
            // FIXME
            // if (file && file.configName) {
            //     config = config.configs[file.configName];
            // }
            break;

        case '.json':
            if (sysPath.basename(filePath) === 'package.json') {
                config = loadPackageJSONConfigFile(filePath);
                if (config === null) {
                    return null;
                }
            } else {
                config = loadJSONConfigFile(filePath);
            }
            break;

        case '.yaml':
        case '.yml':
            config = loadYAMLConfigFile(filePath);
            break;

        default:
            config = loadLegacyConfigFile(filePath);
    }

    return config;
};

// Project

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

var writeRC = exports.writeRC = function (rc) {
    fs.writeFileSync(YKIT_RC, (0, _stringify2.default)(rc, {}, 4), 'UTF-8');
};

exports.reloadRC = function () {
    var root = childProcess.execSync('npm root -g', {
        encoding: 'utf-8'
    }).split('\n')[0],
        modules = globby.sync(['@*' + sysPath.sep + 'ykit-*', 'ykit-*'], {
        cwd: root
    }).map(function (name) {
        var mt = name.match(ykitModuleReg);
        if (mt && mt.length == 4) {
            return {
                name: mt[2],
                type: mt[3],
                path: root + sysPath.sep + name
            };
        }
    }).filter(function (item) {
        return !!item;
    }),
        rc = readRC();

    rc.commands = modules.filter(function (item) {
        return item.type == 'command';
    });
    rc.configs = modules.filter(function (item) {
        return item.type == 'config';
    });

    writeRC(rc);

    return rc;
};

exports.loadEslintConfig = function (path) {
    try {
        var eslintConfigFile = require('eslint/lib/config/config-file.js');

        var eslintConfPath = eslintConfigFile.getFilenameForDirectory(path);
        return eslintConfPath ? eslintConfigFile.load(eslintConfPath) : {};
    } catch (e) {
        return {};
    }
};

exports.loadIgnoreFile = function (path) {
    var ignoreFile = sysPath.join(path, '.lintignore');
    return fs.existsSync(ignoreFile) ? fs.readFileSync(ignoreFile, 'UTF-8') : '';
};