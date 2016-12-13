'use strict';

/* eslint-disable */

const shell = require('shelljs');
const async = require('async');

const replaceStream = require('replacestream');

const Manager = require('../modules/manager.js');
const UtilFs = require('../utils/fs.js');

exports.usage = '项目初始化';
exports.abbr = 'i';

exports.setOptions = () => {
    optimist.alias('l', 'lint');
    optimist.describe('l', '先进行验证');
};

exports.run = function (options) {
    Manager.reloadRC();

    let cwd = options.cwd,
        defaultName = '',
        packageJsonPath = sysPath.join(cwd, './package.json');

    if (UtilFs.fileExists(packageJsonPath)) {
        defaultName = JSON.parse(fs.readFileSync(packageJsonPath)).name;
    } else {
        defaultName = sysPath.basename(cwd);
    }

    spinner.start();

    // TODO 也许可以改成通过命令行让用户输入
    const projectName = defaultName;
    const initTmplPath = sysPath.resolve(__dirname, '../config/initTmpl/');
    let writePackageJsonStream;

    // 如果初始化时带着初始化类型
    if(typeof process.argv[3] === 'string') {
        const initParam = process.argv[3];
        let isInitReady = false;

        async.series([
            // 寻找是否存在 ykit-config-xxx 的插件
            (callback) => {
                spinner.text =`checking package ykit-config-${initParam}`;
                checkConfigPkg(callback, `ykit-config-${initParam}`, 'taobao.org')
            },
            // 寻找是否存在 @qnpm/ykit-config-xxx 的插件
            (callback) => {
                checkConfigPkg(callback, `@qnpm/ykit-config-${initParam}`, 'corp.qunar.com')
            },
        ], (err) => {
            // results is now equal to ['one', 'two']
            isInitReady ? spinner.succeed() : spinner.fail();
        });

        function checkConfigPkg(callback, packageName, registry) {
            if(!isInitReady) {
                let timeout;
                const child = shell.exec(
                    `npm view ${packageName} --registry http://registry.npm.${registry}`,
                    {silent: true},
                    (code, stdout, stderr) => {
                        if(stdout) {
                            isInitReady = true;
                            initProject(packageName, registry);
                        }
                        clearTimeout(timeout);
                        callback(null);
                    }
                );

                // 防止超时
                timeout = setTimeout(() => {
                    child.kill('SIGINT');
                }, 5000);
            } else {
                callback(null, 'two');
            }
        }
    } else {
        // 只初始化一个空白项目
        initProject();
    }

    function initProject(configPkgName, registry) {
        async.series([
            // 创建 packge.json
            (callback) => {
                if (!UtilFs.fileExists(packageJsonPath)) {
                    writePackageJsonStream = createPackageJson();
                    writePackageJsonStream.on('finish', () => {
                        log('Saved package.json file in ' + cwd);
                        callback(null);
                    });
                } else {
                    callback(null);
                }
            },
            // 创建 ykit.{type}.js
            (callback) => {
                createConfigFile(configPkgName);
                callback(null);
            },
            // 拷贝模板
            (callback) => {
                createTmpl();
                callback(null);
            },
            // 安装 config 插件
            (callback) => {
                if(configPkgName && registry) {
                    installConfigPlugin(configPkgName, registry);
                    callback(null);
                } else {
                    callback(null);
                }
            },
        ], (err, results) => {
            spinner.succeed();

        });
    }

    function installConfigPlugin(configPkgName, registry) {
        if(configPkgName) {
            console.log('installing ' + configPkgName);

            shell.exec(
                `npm install ${configPkgName} --registry http://registry.npm.${registry}`,
                {silent: false},
                (code, stdout, stderr) => {
                    if(!stderr) {
                        console.log('installing ' + configPkgName + ' succeed!!!');
                    }
                }
            );
        }
    }

    function createPackageJson() {
        return fs.createReadStream(sysPath.resolve(initTmplPath, 'package.json'))
                .pipe(replaceStream('#_name', projectName))
                .pipe(fs.createWriteStream(sysPath.resolve(cwd, 'package.json')));
    }

    function createConfigFile(configPkgName) {
        let configFileName = 'ykit.js';

        if(configPkgName) {
            configFileName = configPkgName.match(/ykit-config-([^\-]+)/)
                            ? 'ykit.' + configPkgName.match(/ykit-config-([^\-]+)/)[1] + '.js'
                            : configFileName
        }

        if (!UtilFs.fileExists('./' + configFileName)) {
            const writeStream = fs.createWriteStream(sysPath.resolve(cwd, configFileName));
            const configFilePath = sysPath.resolve(initTmplPath, 'ykit.js');
            const stream = fs.createReadStream(configFilePath).pipe(replaceStream('#_name', projectName)).pipe(writeStream);

            stream.on('finish', () => {
                log('Saved ' + configFileName + ' in ' + cwd);
            });
        }
    }

    function createTmpl() {
        fs.copy(sysPath.resolve(initTmplPath, './src'), sysPath.resolve(cwd, './src'), function (err) {
            if (err) return console.error(err);
        });
        fs.copy(sysPath.resolve(initTmplPath, './index.html'), sysPath.resolve(cwd, './index.html'), function (err) {
            if (err) return console.error(err);
        });
    }
};
