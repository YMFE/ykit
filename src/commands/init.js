'use strict'

require('shelljs/global');
let Manager = require('../modules/manager.js');

exports.usage = "项目初始化";

exports.setOptions = (optimist) => {};

exports.run = function (options)  {

    let cwd = options.cwd,
        initType = options._[1]
    const availableConfigs = ['qunar', 'hy']

    if(initType && availableConfigs.indexOf(initType) > -1){
        const packageName = 'ykit-config-' + initType.trim(),
            configFileName = 'ykit.' + initType.trim() + '.js'

        log('installing ' + packageName + '...');
        if(!fileExists('./' + configFileName)){
            const configTmplPath = sysPath.resolve(__dirname, '../config/ykit.common.js')
            fs.createReadStream(configTmplPath).pipe(fs.createWriteStream(sysPath.resolve(cwd, configFileName)));
        }

        exec('npm i --save ' + 'ykit-config-' + initType, {silent:false}, (code, stdout, stderr) => {
            if(stderr) {
                log(stderr);
            }

            if(code === 0){
                log('初始化成功')
            }
        })
    }
}

function fileExists(filePath) {
	try {
		return fs.statSync(filePath).isFile();
	} catch (err) {
		return false;
	}
}
