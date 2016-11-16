'use strict';

var inquirer = require('inquirer');
var async = require('async');
var child_process = require('child_process');

exports.usage = '代码质量检测';

exports.setOptions = function (optimist) {
    optimist.alias('d', 'dir');
    optimist.describe('d', '检测特定目录/文件');
    optimist.alias('t', 'type');
    optimist.describe('t', '检测特定目录/文件');
};

exports.run = function (options) {
    var project = this.project,
        dir = options.d || options.dir,
        lintType = options.t || options.type;

    var isGoingToContinue = true;

    try {
        require.resolve('eslint');
    } catch (e) {
        isGoingToContinue = false;

        var questions = [{
            type: 'confirm',
            name: 'isGoingtoInstall',
            message: 'lint plugin not installed yet, wounld you like to install it now?'
        }];

        inquirer.prompt(questions).then(function (answers) {
            if (answers.isGoingtoInstall) {
                if (!(process.getuid && process.getuid() === 0)) {
                    warn('安装权限不足, 请使用sudo执行 ykit lint');
                    process.exit(1);
                }

                var installCmd = 'npm i eslint@2.13.1 stylelint@6.9.0 --registry https://registry.npm.taobao.org';
                try {
                    log('intalling eslint & stylelint ...');
                    log(child_process.execSync(installCmd, { cwd: sysPath.resolve(__dirname, '../../'), encoding: 'utf8' }));
                } catch (e) {
                    error(e);
                }
            }
        });
    }

    // lint type
    var lintFileTypes = ['js', 'css'];
    if (lintType) {
        if (lintFileTypes.indexOf(lintType) > -1) {
            lintFileTypes = [lintType];
        } else {
            error('lintType只能为"js"或"css"');
            process.exit(1);
        }
    }
    var lintFuncs = lintFileTypes.map(function (lintFileTypeItem) {
        return lintFileTypeItem === 'js' ? function (callback) {
            return project.lint(dir, callback);
        } : function (callback) {
            return project.lintCss(dir, callback);
        };
    });

    if (isGoingToContinue) {
        async.series(lintFuncs, function (err, results) {
            if (!err) {
                if (results[0] && results[1]) {
                    success('All files complete without error.');
                    process.exit(0);
                } else {
                    process.exit(1);
                }
            } else if (err === true) {
                error('Lint Error');
                process.exit(1);
            } else {
                error(err);
            }
        });
    }
};