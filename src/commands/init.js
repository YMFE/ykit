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

    // TODO 也许可以改成通过命令行让用户输入
    const projectName = defaultName;
    const initTmplPath = sysPath.resolve(__dirname, '../config/initTmpl/');

    // 如果初始化时带着初始化类型
    if(typeof process.argv[3] === 'string') {
        const initParam = process.argv[3];
        let isInitReady = false;

        spinner.start();
        spinner.text =`checking package ykit-config-${initParam}`;
        async.series([
            // 寻找是否存在 @qnpm/ykit-config-xxx 的插件
            (callback) => {
                checkConfigPkg(callback, `@qnpm/ykit-config-${initParam}`, 'corp.qunar.com')
            },
            // 寻找是否存在 ykit-config-xxx 的插件
            (callback) => {
                checkConfigPkg(callback, `ykit-config-${initParam}`, 'taobao.org')
            },
        ], (err) => {
            // results is now equal to ['one', 'two']
            if(isInitReady) {
                spinner.stop()
            } else {
                spinner.text(`can't find package ykit-config-${initParam}`)
                spinner.fail()
            }
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
        let funcSeries = []

        if(configPkgName) {
            funcSeries = [
                (callback) => createPackageJson(callback),
                (callback) => installConfigPlugin(callback, configPkgName, registry),
                (callback) => createConfigFile(callback, configPkgName),
                (callback) => setup(callback)
            ]
        } else {
            funcSeries = [
                (callback) => createPackageJson(callback),
                (callback) => createConfigFile(callback, configPkgName),
                (callback) => createTmpl(callback)
            ]
        }

        async.series(funcSeries, (err, results) => {
        });
    }

    function installConfigPlugin(callback, configPkgName, registry) {
        log('installing ' + configPkgName + '...');

        shell.exec(
            `npm install ${configPkgName} --registry http://registry.npm.${registry} --save`,
            {silent: false},
            (code, stdout, stderr) => {
                callback(null) // npm install 中的警告也会当成 stderr 输出，所以不在这里做错误处理
            }
        );
    }

    function createPackageJson(callback) {
        if (!UtilFs.fileExists(packageJsonPath)) {
            let writePackageJsonStream = create();
            writePackageJsonStream.on('finish', () => {
                log('Saved package.json file in ' + cwd);
                callback(null);
            });
        } else {
            callback(null);
        }

        function create() {
            return fs.createReadStream(sysPath.resolve(initTmplPath, 'package.json'))
                    .pipe(replaceStream('#_name', projectName))
                    .pipe(fs.createWriteStream(sysPath.resolve(cwd, 'package.json')));
        }
    }

    function createConfigFile(callback, configPkgName) {
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

            callback(null)
        } else {
            callback(null)
        }
    }

    function setup(callback) {
        const initParams = process.argv.slice(4);
        const setupCmd = `ykit setup ${initParams.join(' ')}`;
        shell.exec(
            setupCmd,
            {silent: true},
            (code, stdout, stderr) => {
                callback(null)
            }
        );
    }

    function createTmpl(callback) {
        fs.copySync(sysPath.resolve(initTmplPath, './index.html'), sysPath.resolve(cwd, './index.html'));
        fs.copySync(sysPath.resolve(initTmplPath, './src'), sysPath.resolve(cwd, './src'));
        callback(null);
    }
};
