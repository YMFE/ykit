'use strict';

var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
var child_process = require('child_process');

var UtilFs = require('../utils/fs.js');

exports.usage = '线上编译';

exports.setOptions = function (optimist) {};

exports.run = function (options) {
    var buildOpts = this.project.config.build || {};

    // 确定使用 npm_cache_share 还是 npm
    var currentNpm = null;
    if (buildOpts.cache === false) {
        currentNpm = 'npm';
        log('将使用 npm 进行模块安装');
    } else {
        try {
            child_process.execSync('npm_cache_share -h');

            if (UtilFs.fileExists(sysPath.join(this.project.cwd, 'npm-shrinkwrap.json'))) {
                currentNpm = 'npm_cache_share';
                log('将使用 npm_cache_share 进行模块安装');
            } else {
                currentNpm = 'npm';
                log('npm-shrinkwrap.json 不存在，将使用 npm 进行模块安装');
            }
        } catch (e) {
            currentNpm = 'npm';
            log('npm_cache_share 不存在，将使用 npm 进行模块安装');
        }
    }

    // 确定 node 版本
    var switchNodeCmd = '';
    if (buildOpts.nodeVersion) {
        log('指定 node version: ' + buildOpts.nodeVersion);
    }
    switch (buildOpts.nodeVersion) {
        case '0.12':
            switchNodeCmd = '';
            break;
        case '4':
        case '4.2.4':
            switchNodeCmd = 'export PATH=/usr/local/n/versions/node/4.2.4/bin:$PATH';
            break;
        case '6':
        case '6.2.1':
        default:
            switchNodeCmd = 'export PATH=/usr/local/n/versions/node/6.2.1/bin:$PATH';
            break;
    }

    // build process
    process.stdout && process.stdout.write('node version: ') && run('node -v');
    process.stdout && process.stdout.write('npm version: ') && run('npm -v');
    run('ykit -v');

    // cache clean
    currentNpm === 'npm' && run('npm cache clean');

    // build
    log('Build Started.');
    run(currentNpm + ' install --registry http://registry.npm.corp.qunar.com/');
    run('ykit pack -m -q');
    clearGitHooks();
    log('Build Finished.\n');

    function run(cmd) {
        if (!cmd) {
            return;
        }

        if (switchNodeCmd) {
            cmd = switchNodeCmd + ' && ' + cmd;
        }

        var child = shell.exec(cmd, {
            silent: false,
            async: false
        });

        if (child.code !== 0) {
            log('Building encounted error while executing ' + cmd);
            process.exit(1);
        }

        return;
    }

    function clearGitHooks() {
        var gitHooksDir = './.git/hooks/';

        if (fs.lstatSync(gitHooksDir).isDirectory()) {
            fs.readdirSync(gitHooksDir).forEach(function (file) {
                var currentPath = path.join(gitHooksDir, file);
                fs.writeFileSync(currentPath, '');
            });
            log('Git hooks have been cleared.');
        }
    }
};