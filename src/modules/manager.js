'use strict';

let Project = require('../models/Project.js'),
    eslintConfigFile = require("eslint/lib/config/config-file.js"),
    ykitModuleReg = /^(@[^\/]+\/)?(ykit\-(\w+)\-[\w\-]+)$/,
    loadYAMLConfigFile = (filePath) => {
        try {
            return yaml.safeLoad(fs.readFileSync(filePath, 'UTF-8')) || {};
        } catch (e) {
            e.message = "Cannot read config file: " + filePath + "\nError: " + e.message;
            throw e;
        }
    },
    loadJSONConfigFile = (filePath) => {
        try {
            return JSON5.parse(fs.readFileSync(filePath, 'UTF-8'));
        } catch (e) {
            e.message = "Cannot read config file: " + filePath + "\nError: " + e.message;
            throw e;
        }
    },
    loadLegacyConfigFile = (filePath) => {
        try {
            return yaml.safeLoad(fs.readFileSync(filePath, 'UTF-8')) || {};
        } catch (e) {
            e.message = "Cannot read config file: " + filePath + "\nError: " + e.message;
            throw e;
        }
    },
    loadJSConfigFile = (filePath) => {
        try {
            return requireUncached(filePath);
        } catch (e) {
            e.message = "Cannot read config file: " + filePath + "\nError: " + e.message;
            throw e;
        }
    },
    loadPackageJSONConfigFile = (filePath) => {
        try {
            return loadJSONConfigFile(filePath).eslintConfig || null;
        } catch (e) {
            e.message = "Cannot read config file: " + filePath + "\nError: " + e.message;
            throw e;
        }
    },
    loadConfigFile = (filePath) => {
        let config;

        switch (sysPath.extname(filePath)) {
            case ".js":
                config = loadJSConfigFile(filePath);
                if (file.configName) {
                    config = config.configs[file.configName];
                }
                break;

            case ".json":
                if (sysPath.basename(filePath) === "package.json") {
                    config = loadPackageJSONConfigFile(filePath);
                    if (config === null) {
                        return null;
                    }
                } else {
                    config = loadJSONConfigFile(filePath);
                }
                break;

            case ".yaml":
            case ".yml":
                config = loadYAMLConfigFile(filePath);
                break;

            default:
                config = loadLegacyConfigFile(filePath);
        }

        return config;
    };


// Project

let projectCache = {};

exports.getProject = (cwd) => {
    if (!projectCache[cwd]) {
        projectCache[cwd] = new Project(cwd);
    }
    return projectCache[cwd];
};


// Command
exports.getCommands = () => {
    return globby.sync(['*.js'], {
            cwd: YKIT_COMMANDS_PATH
        })
        .map((name) => {
            return {
                name: sysPath.basename(name, '.js'),
                module: require(sysPath.join(YKIT_COMMANDS_PATH, name))
            };
        })
        .concat((readRC().commands || []).map((item) => {
            return {
                name: item.name,
                module: require(item.path)
            }
        }))
        .filter((command) => !!command.module);
};

// ykitrc
let readRC = exports.readRC = () => {
    try {
        return JSON5.parse(fs.readFileSync(YKIT_RC, 'UTF-8'));
    } catch (e) {
        // warn('读取 .ykitrc 失败！');
    }
    return {}
};

let writeRC = exports.writeRC = (rc) => {
    fs.writeFileSync(YKIT_RC, JSON.stringify(rc, {}, 4), 'UTF-8')
};

let reloadRC = exports.reloadRC = () => {
    let root = childProcess.execSync('npm root -g', {
            encoding: 'utf-8'
        }).split('\n')[0],
        modules = globby.sync(['@*' + sysPath.sep + 'ykit-*', 'ykit-*'], {
            cwd: root
        }).map((name) => {
            let mt = name.match(ykitModuleReg);
            if (mt && mt.length == 4) {
                return {
                    name: mt[2],
                    type: mt[3],
                    path: root + sysPath.sep + name
                };
            }
        }).filter((item) => !!item),
        rc = readRC();

    rc.commands = modules.filter((item) => item.type == 'command');
    rc.configs = modules.filter((item) => item.type == 'config');

    writeRC(rc);

    return rc;
};

// lint config

exports.loadEslintConfig = (path) => {
    let eslintConfPath = eslintConfigFile.getFilenameForDirectory(path);
    return eslintConfPath ? eslintConfigFile.load(eslintConfPath) : {};
};

exports.loadStylelintConfig = (path) => {
    let stylelintConfPath = globby.sync([
        ".stylelintrc.js",
        ".stylelintrc.yaml",
        ".stylelintrc.yml",
        ".stylelintrc.json",
        ".stylelintrc",
        "package.json"
    ], {
        cwd: path
    })[0];
    return stylelintConfPath ? loadConfigFile(sysPath.join(path, stylelintConfPath)) : {};
};

exports.loadIgnoreFile = (path) => {
    let ignoreFile = sysPath.join(path, '.lintignore');
    return fs.existsSync(ignoreFile) ? fs.readFileSync(ignoreFile, 'UTF-8') : '';
};
