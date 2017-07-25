'use strict';

var shell = require('shelljs');
var async = require('async');

var replaceStream = require('replacestream');

var Manager = require('../modules/manager.js');
var UtilFs = require('../utils/fs.js');

exports.usage = '项目初始化';
exports.abbr = 'i';

exports.setOptions = function () {};

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

	// TODO 也许可以改成通过命令行让用户输入
	var projectName = defaultName;
	var initTmplPath = sysPath.resolve(__dirname, '../../static/initTmpl/');

	// 如果初始化时带着初始化类型
	if (typeof process.argv[3] === 'string') {
		var checkConfigPkg = function checkConfigPkg(callback, packageName, registry) {
			if (!isInitReady) {
				var timeout = void 0;
				var child = shell.exec('npm view ' + packageName + ' --registry https://' + registry, {
					silent: true
				}, function (code, stdout, stderr) {
					if (stdout) {
						isInitReady = true;
						initProject(packageName, registry);
					}
					clearTimeout(timeout);
					callback(null);
				});

				// 防止超时
				timeout = setTimeout(function () {
					child.kill('SIGINT');
				}, 20000);
			} else {
				callback(null, 'two');
			}
		};

		var initParam = process.argv[3];
		var qunarRegistry = 'repo.corp.qunar.com/artifactory/api/npm/npm-qunar';
		var taobaoRegistry = 'registry.npm.taobao.org';
		var isInitReady = false;

		spinner.start();
		spinner.text = 'Checking package ykit-config-' + initParam;
		async.series([
		// qnpm 寻找是否存在 @qnpm/ykit-config-xxx 的插件
		function (callback) {
			checkConfigPkg(callback, '@qnpm/ykit-config-' + initParam, qunarRegistry);
		},
		// qnpm 寻找是否存在 ykit-config-xxx 的插件
		function (callback) {
			checkConfigPkg(callback, 'ykit-config-' + initParam, qunarRegistry);
		},
		// cnpm 寻找是否存在 ykit-config-xxx 的插件
		function (callback) {
			checkConfigPkg(callback, 'ykit-config-' + initParam, taobaoRegistry);
		}], function () {
			if (isInitReady) {
				spinner.stop();
			} else {
				spinner.text = 'Can\'t find package ykit-config-' + initParam;
				spinner.fail();
			}
		});
	} else {
		// 只初始化一个空白项目
		initProject();
	}

	function initProject(configPkgName, registry) {
		var funcSeries = [];

		if (configPkgName) {
			funcSeries = [function (callback) {
				return createPackageJson(callback);
			}, function (callback) {
				return installConfigPlugin(callback, configPkgName, registry);
			}, function (callback) {
				return createConfigFile(callback, configPkgName);
			}, function (callback) {
				return setup(callback, configPkgName);
			}];
		} else {
			funcSeries = [function (callback) {
				return createPackageJson(callback);
			}, function (callback) {
				return createConfigFile(callback, configPkgName);
			}, function (callback) {
				return createTmpl(callback);
			}];
		}

		async.series(funcSeries, function (err, results) {});
	}

	function installConfigPlugin(callback, configPkgName, registry) {
		log('Install ' + configPkgName + '...');

		shell.exec('npm install ' + configPkgName + ' --registry https://' + registry + ' --save', {
			silent: false
		}, function (code, stdout, stderr) {
			callback(null); // npm install 中的警告也会当成 stderr 输出，所以不在这里做错误处理
		});
	}

	function createPackageJson(callback) {
		if (!UtilFs.fileExists(packageJsonPath)) {
			var writePackageJsonStream = create();
			writePackageJsonStream.on('finish', function () {
				logInfo('Write ' + 'package.json'.green.bold + ' in ' + cwd);
				callback(null);
			});
		} else {
			callback(null);
		}

		function create() {
			return fs.createReadStream(sysPath.resolve(initTmplPath, 'package.json')).pipe(replaceStream('@PROJECT_NAME', projectName)).pipe(fs.createWriteStream(sysPath.resolve(cwd, 'package.json')));
		}
	}

	function createConfigFile(callback, configPkgName) {
		var pluginName = configPkgName ? configPkgName.match(/ykit-config-([^\-]+)/)[1] : '';
		var configFileName = 'ykit.js';

		if (!UtilFs.fileExists('./' + configFileName)) {
			var writeStream = fs.createWriteStream(sysPath.resolve(cwd, configFileName));
			var configFilePath = sysPath.resolve(initTmplPath, 'ykit.js');
			var stream = fs.createReadStream(configFilePath).pipe(replaceStream('@PROJECT_NAME', projectName)).pipe(replaceStream('@PLUGIN_NAME', pluginName ? '[\'' + pluginName + '\']' : '[]')).pipe(writeStream);

			stream.on('finish', function () {
				logInfo('Write ' + configFileName.green.bold + ' in ' + cwd);
				callback(null);
			});
		} else {
			callback(null);
		}
	}

	function setup(callback) {
		var initParams = process.argv.slice(4) || [];
		var setupCmd = 'node ' + sysPath.join(__dirname, '../../bin/ykit') + ' setup ' + initParams.join(' ');

		logInfo('Run ' + setupCmd);
		shell.exec(setupCmd, {
			silent: false
		}, function (code, stdout, stderr) {
			callback(null);
		});
	}

	function createTmpl(callback) {
		fs.copySync(sysPath.resolve(initTmplPath, './index.html'), sysPath.resolve(cwd, './index.html'));
		fs.copySync(sysPath.resolve(initTmplPath, './src'), sysPath.resolve(cwd, './src'));
		callback(null);
	}
};