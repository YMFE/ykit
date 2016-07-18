'use strict'

require('shelljs/global');
const replaceStream = require('replacestream');
const inquirer = require('inquirer');
const Manager = require('../modules/manager.js');

exports.usage = "项目初始化";

exports.setOptions = (optimist) => {};

exports.run = function (options)  {

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

        const initTmplPath = sysPath.resolve(__dirname, '../config/initTmpl/')

        answers.name = answers.name || defaultName

        console.log('answers.name', answers.name);

        // 如果没有package.json，先添加package.json
        if(answers.name){
            fs.createReadStream(sysPath.resolve(initTmplPath, 'package.json'))
                .pipe(replaceStream('#_name', answers.name))
                .pipe(fs.createWriteStream(sysPath.resolve(cwd, 'package.json')));
        }

        // 添加qunar.xxx.js
        if(answers.type) {
            const packageName = 'ykit-config-' + answers.type,
                configFileName = 'ykit.' + answers.type + '.js'

            log('installing ' + packageName + '...');
            if(!fileExists('./' + configFileName)) {
                fs.createReadStream(sysPath.resolve(initTmplPath, 'ykit.common.js'))
                    .pipe(replaceStream('#_name', answers.name))
                    .pipe(fs.createWriteStream(sysPath.resolve(cwd, configFileName)));
            }

            exec('npm i --save ' + 'ykit-config-' + answers.type, {silent:false}, (code, stdout, stderr) => {
                if(stderr) {
                    log(stderr);
                }

                if(code === 0){
                    log('初始化成功')
                }
            })
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
