'use strict';

var Manager = require('../modules/manager.js');
var child_process = require('child_process');
var requireg = require('requireg');
var request = require('request');
var semver = require('semver');

exports.usage = '重载插件';

exports.setOptions = function (optimist) {
    optimist.alias('s', 'service');
    optimist.describe('s', '拉取插件服务地址');
    optimist.alias('g', 'global');
    optimist.describe('g', 'reload全局插件');
};

exports.run = function (options) {
    var servicePath = options.s || options.service || 'http://l-uedmobile0.h.dev.cn0.qunar.com:3000/download';
    var reloadGlobal = options.g || options.global || false;

    if (reloadGlobal) {
        // 重载全局插件
        Manager.reloadRC();
    } else {
        (function () {
            // 检查devDependencies中的ykit-config-{name}
            var packageJsonContent = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf-8' }));
            var ykitModuleReg = /^(@[^\/]+\/)(ykit\-(\w+)\-[\w\-]+)$/;

            if (packageJsonContent.devDependencies) {
                (function () {
                    var devDependencies = packageJsonContent.devDependencies;
                    Object.keys(devDependencies).map(function (depName) {
                        if (ykitModuleReg.test(depName) && !requireg.resolve(depName)) {
                            // get dep version
                            var version = devDependencies[depName].match(/\d+.\d+.\d+/);
                            version = version && version[0];

                            var packagePath = './node_modules/@qnpm';

                            if (semver.valid(version)) {
                                (function () {
                                    // 确保存在@qnpm目录
                                    mkdirp.sync(packagePath);

                                    // 下载
                                    var tarName = depName + '@' + version + '.tar';
                                    var extractPath = sysPath.join(process.cwd(), './node_modules/', tarName);
                                    var downloadPath = servicePath + '/' + tarName;
                                    var downloadStream = request(downloadPath).on('response', function (response) {
                                        log('[' + response.statusCode + '] downloading ' + downloadPath);
                                    }).pipe(fs.createWriteStream(extractPath));

                                    // 解压
                                    downloadStream.on('finish', function (e) {
                                        if (e) {
                                            return error(e);
                                        }

                                        log('extracting ' + extractPath);
                                        child_process.exec('cd ./node_modules/@qnpm/ && tar -xf ' + extractPath, function (e) {
                                            if (e) {
                                                return error(e);
                                            }

                                            success('complete!');
                                            fs.unlinkSync(extractPath);
                                        });
                                    });
                                })();
                            } else {
                                error(depName + '版本号必须确定，如0.1.0');
                            }
                        }
                    });
                })();
            }
        })();
    }
};