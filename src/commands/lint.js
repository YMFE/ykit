'use strict';

const inquirer = require('inquirer');
const async = require('async');
const child_process = require('child_process');

exports.usage = '代码质量检测';

exports.setOptions = (optimist) => {
    optimist.alias('d', 'dir');
    optimist.describe('d', '检测特定目录/文件');
};

exports.run = function (options)  {
    let project = this.project,
        dir = options.d || options.dir;

    let isGoingToContinue = true;

    try {
        require.resolve('eslint');
    } catch(e) {
        isGoingToContinue = false;

        var questions = [{
            type: 'confirm',
            name: 'isGoingtoInstall',
            message: 'lint plugin not installed yet, wounld you like to install it now?'
        }];

        inquirer.prompt(questions).then((answers) => {
            if(answers.isGoingtoInstall) {
                if(!(process.getuid && process.getuid() === 0)){
                    warn('安装权限不足, 请使用sudo执行 ykit lint');
                    process.exit(1);
                }

                const installCmd = 'npm i eslint@2.13.1 --registry https://registry.npm.taobao.org';
                try {
                    log('intalling eslint...');
                    log(child_process.execSync(installCmd, {cwd: sysPath.resolve(__dirname, '../../'), encoding: 'utf8'}));
                } catch (e) {
                    error(e);
                }
            }
        });
    }

    const lintFuncs = [
        // 暂时只 lint js
        function(callback) {
            project.lint(dir, callback);
        }
    ];

    if(isGoingToContinue) {
        async.series(lintFuncs, (err, results) => {
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
