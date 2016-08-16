'use strict'

const execSync = require('child_process').execSync;
const replaceStream = require('replacestream');
const inquirer = require('inquirer');
const Manager = require('../modules/manager.js');

exports.usage = "项目初始化";

exports.setOptions = (optimist) => {};

exports.run = function (options)  {
    Manager.reloadRC()

    let cwd = options.cwd,
        projectName = options._[1],
        defaultName = ''

    if(fileExists('./package.json')){
        defaultName = JSON.parse(fs.readFileSync('./package.json')).name
    } else {
        defaultName = sysPath.basename(cwd)
    }

    const questions = [{
        type: 'input',
        name: 'name',
        message: 'project name(' + defaultName + '):'
    }, {
        type: 'list',
        name: 'type',
        message: 'config type:',
        choices: [
            'qunar',
            'hy',
            'xta',
            'none',
        ]
    }]

    inquirer.prompt(questions).then((answers) => {
        answers.name = answers.name || defaultName;

        const initTmplPath = sysPath.resolve(__dirname, '../config/initTmpl/');
        let writePackageJsonStream;

        // 如果没有package.json，先添加package.json
        if(answers.name){
            writePackageJsonStream = createPakcageJson();
        }

        if(!writePackageJsonStream) {
            createConfigFile(answers.type);
            installDependencies();
        } else {
            writePackageJsonStream.on('finish', () => {
                log('Successfully created package.json file in ' + cwd);

                createConfigFile(answers.type);
                installDependencies(answers.type);
            });
        }

        function createPakcageJson() {
            return fs.createReadStream(sysPath.resolve(initTmplPath, 'package.json'))
                .pipe(replaceStream('#_name', answers.name))
                .pipe(fs.createWriteStream(sysPath.resolve(cwd, 'package.json')));
        }

        function createConfigFile(configType) {
            const configFileName = configType !== 'none' ? 'ykit.' + configType + '.js' : 'ykit.js';

            if(!fileExists('./' + configFileName)) {
                const stream = fs.createReadStream(sysPath.resolve(initTmplPath, 'ykit.common.js'))
                    .pipe(replaceStream('#_name', answers.name))
                    .pipe(fs.createWriteStream(sysPath.resolve(cwd, configFileName)));

                stream.on('finish', () => {
                    log('Successfully created ' + configFileName + ' file in ' + cwd);
                });
            }
        }

        function installDependencies(configType) {
            if(configType === 'none') {
                return
            }

            const  packageName = 'ykit-config-' + configType,
                installConfigPackageCmd = 'npm i --save --registry http://registry.npm.corp.qunar.com/ git+ssh://git@gitlab.corp.qunar.com:mfe/ykit-config-' + configType + '.git';

            log('Installing ' + packageName + '...');
            execSync(installConfigPackageCmd);
        }
    });
}

function fileExists(filePath) {
	try {
		return fs.statSync(filePath).isFile();
	} catch (err) {
		return false;
	}
}
