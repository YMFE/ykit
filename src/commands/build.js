'use strict';

var fs = require('fs');
var path = require('path');
var shell = require('shelljs');

exports.usage = '线上编译';

exports.setOptions = (optimist) => {

};

exports.run = function(options) {
    var buildOpts = this.project.config.build || {};

    // 确定使用 npm_cache_share 还是 npm
    var currentNpm = null;
    if (buildOpts.cache === false) {
        currentNpm = 'npm';
        log('指定 npm 进行模块安装');
    } else {
        currentNpm = 'npm_cache_share';
        log('指定 npm_cache_share 进行模块安装');
        process.stdout && process.stdout.write('npm_cache_share version: ') && run('npm_cache_share -V');
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
        switchNodeCmd = 'export PATH=/usr/local/n/versions/node/6.2.1/bin:$PATH';
        break;
    default:
    }

    // build process
    log('Build Started.');
    process.stdout && process.stdout.write('node version: ') && run('node -v');
    process.stdout && process.stdout.write('npm version: ') && run('npm -v');
    run('ykit -v');
    run(switchNodeCmd);
    run(currentNpm + ' install --registry http://registry.npm.corp.qunar.com/');
    run('ykit pack -m -q');
    clearGitHooks();
    log('Build Finished.\n');

    function run(cmd) {
        if (!cmd) {
            return;
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
            fs.readdirSync(gitHooksDir).forEach(function(file) {
                var currentPath = path.join(gitHooksDir, file);
                fs.writeFileSync(currentPath, '');
            });
            log('Git hooks have been cleared.');
        }
    }
};
