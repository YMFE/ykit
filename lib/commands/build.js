'use strict';

var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
var child_process = require('child_process');

var UtilFs = require('../utils/fs.js');

// 已指定 node 版本则不再强制使用 node 6
var switchNodeCmd = 'echo ""';
if (!process.env.NODE_VER) {
    switchNodeCmd = 'export PATH=/usr/local/n/versions/node/6.2.1/bin:$PATH';
}

exports.usage = '线上编译';

exports.setOptions = function (optimist) {};

exports.npmInstall = function () {
    var currentNpm = null;

    try {
        child_process.execSync('npm_cache_share -h');

        if (UtilFs.fileExists(sysPath.join(process.cwd(), 'npm-shrinkwrap.json'))) {
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

    // cache clean
    currentNpm === 'npm' && execute('npm cache clean');

    // install
    execute(currentNpm + ' install --registry http://registry.npm.corp.qunar.com/');
};

exports.run = function (options) {
    // build process
    process.stdout && process.stdout.write('node version: ') && execute('node -v');
    process.stdout && process.stdout.write('npm version: ') && execute('npm -v');
    execute('ykit -v');

    // build
    log('Build Started.');
    execute('ykit pack -m -q');
    clearGitHooks();
    log('Build Finished.\n');

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

function execute(cmd) {
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