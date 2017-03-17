'use strict';

var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
var child_process = require('child_process');
var requireg = require('requireg');

var UtilFs = require('../utils/fs.js');

// 已指定 node 版本则不再强制使用 node 6
var switchNodeCmd = 'echo ""';
if (!process.env.NODE_VER) {
    switchNodeCmd = 'export PATH=/usr/local/n/versions/node/6.2.1/bin:$PATH';
}

exports.usage = '线上编译';

exports.setOptions = function (optimist) {};

exports.npmInstall = function (a) {
    var currentNpm = null;
    var cwd = process.cwd();

    // 检测是否存在 ykit.*.js
    var configFile = globby.sync(['ykit.*.js', 'ykit.js'], { cwd: cwd })[0];
    if (!configFile) {
        logError('Local ykit.js not found in' + cwd);
        process.exit(1);
    }

    // 检测是否存在 node_modules
    var isNodeModulesExists = fs.existsSync(sysPath.join(cwd, 'node_modules'));
    if (isNodeModulesExists) {
        logError('Find node_modules in the current directory which can cause compilation failure.');
        logError('Please remove it from your registry.');
        logInfo('Visit ' + 'http://ued.qunar.com/ykit/docs-%E5%8F%91%E5%B8%83.html'.underline + ' for doc.');
        process.exit(1);
    }

    try {
        child_process.execSync('npm_cache_share -h');

        if (UtilFs.fileExists(sysPath.join(cwd, 'yarn.lock'))) {
            currentNpm = 'npm_cache_share';
            log('Installing npm modules with npm_cache_share + yarn.');
        } else if (UtilFs.fileExists(sysPath.join(cwd, 'npm-shrinkwrap.json'))) {
            currentNpm = 'npm_cache_share';
            log('Installing npm modules with npm_cache_share + npm.');
        } else {
            currentNpm = 'npm';
            log('Installing npm modules with npm.');
            logWarn('please use yarn or shrinkwrap to lock down the versions of packages.');
            logInfo('Visit ' + 'http://ued.qunar.com/ykit/docs-npm%20shrinkwrap.html'.underline + ' for doc.');
        }
    } catch (e) {
        currentNpm = 'npm';
        log('Installing npm modules with npm.');
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
    log('Building Started.');
    execute('ykit pack -m -q');
    clearGitHooks();
    log('Building Finished.\n');

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
        logError('Building encounted error while executing ' + cmd);
        process.exit(1);
    }

    return;
}