'use strict';

/* eslint-disable */

var shell = require('shelljs');
var async = require('async');

var replaceStream = require('replacestream');

var Manager = require('../modules/manager.js');
var UtilFs = require('../utils/fs.js');

exports.usage = '项目初始化';
exports.abbr = 'i';

exports.setOptions = function () {
    optimist.alias('l', 'lint');
    optimist.describe('l', '先进行验证');
};

exports.run = function (options) {
    Manager.reloadRC();

    var cwd = options.cwd,
        defaultName = '',
        packageJsonPath = sysPath.join(cwd, './package.json');

    if (UtilFs.fileExists(packageJsonPath)) {
        defaultName = JSON.parse(fs.readFileSync(packageJsonPath)).name;
    } else {
        defaultName = sysPath.basename(cwd);
    }

    spinner.start();

    // TODO 也许可以改成通过命令行让用户输入
    var projectName = defaultName;
    var initTmplPath = sysPath.resolve(__dirname, '../config/initTmpl/');
    var writePackageJsonStream = void 0;

    // 如果初始化时带着初始化类型
    if (typeof process.argv[3] === 'string') {
        (function () {
            var checkInitCmd = function checkInitCmd(callback) {
                shell.exec('node ~/Desktop/pro/ykit/bin/ykit ' + initParam + ' init', { silent: true }, function (code, stdout, stderr) {
                    if (stdout.indexOf('X') > -1) {
                        // do nothing
                    } else {
                        isInitReady = true;
                    }
                    callback(null, 'one');
                });
            };

            var checkConfigPkg = function checkConfigPkg(callback, packageName, registry) {
                if (!isInitReady) {
                    (function () {
                        var timeout = void 0;
                        var child = shell.exec('npm view ' + packageName + ' --registry https://registry.npm.' + registry + '.org', { silent: true }, function (code, stdout, stderr) {
                            if (stdout) {
                                isInitReady = true;
                                initProject();
                            }
                            clearTimeout(timeout);
                            callback(null);
                        });

                        // 防止超时
                        timeout = setTimeout(function () {
                            child.kill('SIGINT');
                        }, 5000);
                    })();
                } else {
                    callback(null, 'two');
                }
            };

            var initParam = process.argv[3];
            var isInitReady = false;

            async.series([
            // 首先寻找是否存在 ykit xxx init 命令
            function (callback) {
                spinner.text = 'checking cmd ykit ' + initParam + ' init';
                checkInitCmd(callback);
            }
            // TODO
            // 寻找是否存在 ykit-config-xxx 的插件
            // (callback) => {
            //     spinner.text =`checking package ykit-config-${initParam}`;
            //     checkConfigPkg(callback, `ykit-config-${initParam}`, 'taobao')
            // },
            // // 寻找是否存在 @qnpm/ykit-config-xxx 的插件
            // (callback) => {
            //     checkConfigPkg(callback, `@qnpm/ykit-config-${initParam}`, 'corp.qunar')
            // },
            ], function (err) {
                // results is now equal to ['one', 'two']
                isInitReady ? spinner.succeed() : spinner.fail();
            });
        })();
    } else {
        // 如果没有package.json，先添加package.json
        initProject();
    }

    function initProject() {
        async.series([
        // 首先寻找是否存在 ykit xxx init 命令
        function (callback) {
            if (!UtilFs.fileExists(packageJsonPath)) {
                writePackageJsonStream = createPackageJson();
                writePackageJsonStream.on('finish', function () {
                    log('Saved package.json file in ' + cwd);
                    callback(null);
                });
            } else {
                callback(null);
            }
        }, function (callback) {
            createConfigFile();
            callback(null);
        }, function (callback) {
            createTmpl();
            callback(null);
        }], function (err, results) {
            // results is now equal to ['one', 'two']
            spinner.succeed();
        });
    }

    function createPackageJson() {
        return fs.createReadStream(sysPath.resolve(initTmplPath, 'package.json')).pipe(replaceStream('#_name', projectName)).pipe(fs.createWriteStream(sysPath.resolve(cwd, 'package.json')));
    }

    function createConfigFile() {
        var configFileName = 'ykit.js';

        if (!UtilFs.fileExists('./' + configFileName)) {
            var writeStream = fs.createWriteStream(sysPath.resolve(cwd, configFileName));
            var configFilePath = sysPath.resolve(initTmplPath, 'ykit.js');
            var stream = fs.createReadStream(configFilePath).pipe(replaceStream('#_name', projectName)).pipe(writeStream);

            stream.on('finish', function () {
                log('Saved ' + configFileName + ' in ' + cwd);
            });
        }
    }

    function createTmpl() {
        fs.move(sysPath.resolve(initTmplPath, './src'), sysPath.resolve(cwd, './src'), function (err) {
            if (err) return console.error(err);
        });
        fs.move(sysPath.resolve(initTmplPath, './index.html'), sysPath.resolve(cwd, './index.html'), function (err) {
            if (err) return console.error(err);
        });
    }
};