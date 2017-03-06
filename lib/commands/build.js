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

    // 检测是否存在 ykit.*.js
    var configFile = globby.sync(['ykit.*.js', 'ykit.js'], { cwd: process.cwd() })[0];
    if (!configFile) {
        log('未发现存在 ykit 配置文件，编译退出.');
        process.exit(1);
    }

    // 检测是否跳过 node_modules
    var ignoreNpm = false;
    if (configFile) {
        var ykitConfig = requireg(sysPath.join(process.cwd(), configFile));
        if (ykitConfig.build && ykitConfig.build.ignoreNpm) {
            ignoreNpm = true;
        }
    }

    // 检测是否存在 node_modules
    var isNodeModulesExists = fs.existsSync(sysPath.join(process.cwd(), 'node_modules'));
    if (isNodeModulesExists && !ignoreNpm) {
        log('发现仓库中已存在 node_modules，这会导致由于 npm 包系统版本不兼容而编译失败，请从仓库中删除并重新编译.');
        process.exit(1);
    }

    try {
        child_process.execSync('npm_cache_share -h');

        if (UtilFs.fileExists(sysPath.join(process.cwd(), 'npm-shrinkwrap.json'))) {
            currentNpm = 'npm_cache_share';
            log('将使用 npm_cache_share 进行模块安装.');
        } else {
            currentNpm = 'npm';
            log('npm-shrinkwrap.json 不存在，将使用 npm 进行模块安装.');
            log('建议使用 shrinkwrap 固定模块版本，否则构建存在风险。文档请参考：http://ued.qunar.com/ykit/docs-npm%20shrinkwrap.html');
        }
    } catch (e) {
        currentNpm = 'npm';
        log('npm_cache_share 不存在，将使用 npm 进行模块安装.');
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