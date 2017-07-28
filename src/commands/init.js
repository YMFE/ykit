'use strict';

const shell = require('shelljs');
const async = require('async');

const replaceStream = require('replacestream');

const Manager = require('../modules/manager.js');
const UtilFs = require('../utils/fs.js');

exports.usage = '项目初始化';
exports.abbr = 'i';

exports.setOptions = () => {};

exports.run = function(options) {
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
	const initTmplPath = sysPath.resolve(__dirname, '../../static/initTmpl/');

	// 如果初始化时带着初始化类型
	if (typeof process.argv[3] === 'string') {
		const initParam = process.argv[3];
		const qunarRegistry = 'repo.corp.qunar.com/artifactory/api/npm/npm-qunar';
		const taobaoRegistry = 'registry.npm.taobao.org';
		let isInitReady = false;

		spinner.start();
		spinner.text = `Checking package ykit-config-${initParam}`;
		async.series([
			// qnpm 寻找是否存在 @qnpm/ykit-config-xxx 的插件
			(callback) => {
				checkConfigPkg(callback, `@qnpm/ykit-config-${initParam}`, qunarRegistry);
			},
			// qnpm 寻找是否存在 ykit-config-xxx 的插件
			(callback) => {
				checkConfigPkg(callback, `ykit-config-${initParam}`, qunarRegistry);
			},
			// cnpm 寻找是否存在 ykit-config-xxx 的插件
			(callback) => {
				checkConfigPkg(callback, `ykit-config-${initParam}`, taobaoRegistry);
			}
		], () => {
			if (isInitReady) {
				spinner.stop();
			} else {
				spinner.text = `Can't find package ykit-config-${initParam}`;
				spinner.fail();
			}
		});

		function checkConfigPkg(callback, packageName, registry) {
			if (!isInitReady) {
				let timeout;
				const child = shell.exec(`npm view ${packageName} --registry https://${registry}`, {
					silent: true
				}, (code, stdout, stderr) => {
					if (stdout) {
						isInitReady = true;
						initProject(packageName, registry);
					}
					clearTimeout(timeout);
					callback(null);
				});

				// 防止超时
				timeout = setTimeout(() => {
					child.kill('SIGINT');
				}, 20000);
			} else {
				callback(null, 'two');
			}
		}
	} else {
		// 只初始化一个空白项目
		initProject();
	}

	function initProject(configPkgName, registry) {
		let funcSeries = [];

		if (configPkgName) {
			funcSeries = [
				(callback) => createPackageJson(callback),
				(callback) => installConfigPlugin(callback, configPkgName, registry),
				(callback) => createConfigFile(callback, configPkgName),
				(callback) => setup(callback, configPkgName)
			];
		} else {
			funcSeries = [
				(callback) => createPackageJson(callback),
				(callback) => createConfigFile(callback, configPkgName),
				(callback) => createTmpl(callback)
			];
		}

		async.series(funcSeries, (err, results) => {});
	}

	function installConfigPlugin(callback, configPkgName, registry) {
		log('Install ' + configPkgName + '...');

		shell.exec(`npm install ${configPkgName} --registry https://${registry} --save`, {
			silent: false
		}, (code, stdout, stderr) => {
			callback(null); // npm install 中的警告也会当成 stderr 输出，所以不在这里做错误处理
		});
	}

	function createPackageJson(callback) {
		if (!UtilFs.fileExists(packageJsonPath)) {
			let writePackageJsonStream = create();
			writePackageJsonStream.on('finish', () => {
				logInfo('Write ' + 'package.json'.green.bold + ' in ' + cwd);
				callback(null);
			});
		} else {
			callback(null);
		}

		function create() {
			return fs.createReadStream(sysPath.resolve(initTmplPath, 'package.json'))
                .pipe(replaceStream('@PROJECT_NAME', projectName))
                .pipe(fs.createWriteStream(sysPath.resolve(cwd, 'package.json')));
		}
	}

	function createConfigFile(callback, configPkgName) {
        const pluginName = configPkgName ? configPkgName.match(/ykit-config-([^\-]+)/)[1] : '';
		const configFileName = 'ykit.js';

		if (!UtilFs.fileExists('./' + configFileName)) {
			const writeStream = fs.createWriteStream(sysPath.resolve(cwd, configFileName));
			const configFilePath = sysPath.resolve(initTmplPath, 'ykit.js');
			const stream = fs.createReadStream(configFilePath)
                .pipe(replaceStream('@PROJECT_NAME', projectName))
                .pipe(replaceStream('@PLUGIN_NAME', pluginName ? '[\'' + pluginName  + '\']' : '[]'))
                .pipe(writeStream);

			stream.on('finish', () => {
				logInfo('Write ' + configFileName.green.bold + ' in ' + cwd);
				callback(null);
			});
		} else {
			callback(null);
		}
	}

	function setup(callback) {
		const initParams = process.argv.slice(4) || [];
		const setupCmd = `node ${sysPath.join(__dirname, '../../bin/ykit')} setup ${initParams.join(' ')}`;

		logInfo('Run ' + setupCmd);
		shell.exec(setupCmd, {
			silent: false
		}, (code, stdout, stderr) => {
			callback(null);
		});
	}

	function createTmpl(callback) {
		fs.copySync(sysPath.resolve(initTmplPath, './index.html'), sysPath.resolve(cwd, './index.html'));
		fs.copySync(sysPath.resolve(initTmplPath, './src'), sysPath.resolve(cwd, './src'));
		callback(null);
	}
};
