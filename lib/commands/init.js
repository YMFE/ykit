'use strict';

var execSync = require('child_process').execSync;
var replaceStream = require('replacestream');
var inquirer = require('inquirer');
var Manager = require('../modules/manager.js');

exports.usage = '项目初始化';
exports.abbr = 'i';

exports.setOptions = function () {};
exports.run = function (options) {
    Manager.reloadRC();

    var cwd = options.cwd,
        defaultName = '',
        packageJsonPath = sysPath.join(cwd, './package.json');

    if (fileExists(packageJsonPath)) {
        defaultName = JSON.parse(fs.readFileSync(packageJsonPath)).name;
    } else {
        defaultName = sysPath.basename(cwd);
    }

    var questions = [{
        type: 'input',
        name: 'name',
        message: 'project name(' + defaultName + '):'
    }, {
        type: 'list',
        name: 'type',
        message: 'project type:',
        choices: [{
            name: 'qunar - 支持sass/less，实现资源带版本号，fekit_moudles打包，sync命令等',
            value: 'qunar'
        }, {
            name: 'fekit - 主要用于fekit项目迁移，兼容fekit配置和模块化语法等',
            value: 'fekit'
        }, {
            name: 'hy    - 支持es6，更多功能仍在开发中',
            value: 'hy'
        }, {
            name: 'basic - 默认基础配置',
            value: 'basic'
        }]
    }];

    inquirer.prompt(questions).then(function (answers) {
        answers.name = answers.name || defaultName;

        var initTmplPath = sysPath.resolve(__dirname, '../config/initTmpl/');
        var writePackageJsonStream = void 0;

        // 如果没有package.json，先添加package.json
        if (!fileExists(packageJsonPath)) {
            writePackageJsonStream = createPackageJson();
        }

        if (!writePackageJsonStream) {
            createConfigFile(answers.type);
            installDependencies(answers.type);
        } else {
            writePackageJsonStream.on('finish', function () {
                log('Successfully created package.json file in ' + cwd);

                createConfigFile(answers.type);
                installDependencies(answers.type);
            });
        }

        function createPackageJson() {
            return fs.createReadStream(sysPath.resolve(initTmplPath, 'package.json')).pipe(replaceStream('#_name', answers.name)).pipe(fs.createWriteStream(sysPath.resolve(cwd, 'package.json')));
        }

        function createConfigFile(configType) {
            var configFileName = configType !== 'basic' ? 'ykit.' + configType + '.js' : 'ykit.js';

            if (!fileExists('./' + configFileName)) {
                var stream = fs.createReadStream(sysPath.resolve(initTmplPath, 'ykit.common.js')).pipe(replaceStream('#_name', answers.name)).pipe(fs.createWriteStream(sysPath.resolve(cwd, configFileName)));

                stream.on('finish', function () {
                    log('Successfully created ' + configFileName + ' file in ' + cwd);
                });
            }
        }

        function installDependencies(configType) {
            if (configType === 'basic') {
                return;
            }

            var packageName = 'ykit-config-' + configType,
                installConfigPackageCmd = 'npm i --save-dev --registry http://registry.npm.corp.qunar.com/ @qnpm/ykit-config-' + configType;

            log('Installing ' + packageName + '...');
            execSync(installConfigPackageCmd);
        }
    });
};

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}