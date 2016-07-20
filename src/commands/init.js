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
        ]
    }]

    inquirer.prompt(questions).then((answers) => {
        answers.name = answers.name || defaultName;

        const initTmplPath = sysPath.resolve(__dirname, '../config/initTmpl/');
        const configFileName = 'ykit.' + answers.type + '.js';
        let writePackageJsonStream;

        // 如果没有package.json，先添加package.json
        if(answers.name){
            writePackageJsonStream = createPakcageJson();
        }

        if(!writePackageJsonStream) {
            createConfigFile();
            installDependencies();
        } else {
            writePackageJsonStream.on('finish', () => {
                log('Successfully created package.json file in ' + cwd);

                createConfigFile();
                installDependencies();
            });
        }

        function createPakcageJson() {
            return fs.createReadStream(sysPath.resolve(initTmplPath, 'package.json'))
                .pipe(replaceStream('#_name', answers.name))
                .pipe(fs.createWriteStream(sysPath.resolve(cwd, 'package.json')));
        }

        function createConfigFile() {
            if(!fileExists('./' + configFileName)) {
                const stream = fs.createReadStream(sysPath.resolve(initTmplPath, 'ykit.common.js'))
                    .pipe(replaceStream('#_name', answers.name))
                    .pipe(fs.createWriteStream(sysPath.resolve(cwd, configFileName)));

                stream.on('finish', () => {
                    log('Successfully created ' + configFileName + ' file in ' + cwd);
                });
            }
        }

        function installDependencies() {
            const  packageName = 'ykit-config-' + answers.type,
                installConfigPackageCmd = 'npm i --save git+ssh://git@gitlab.corp.qunar.com:mfe/ykit-config-' + answers.type + '.git';

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
