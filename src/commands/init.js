'use strict';

const replaceStream = require('replacestream');
const Manager = require('../modules/manager.js');

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

    if (fileExists(packageJsonPath)) {
        defaultName = JSON.parse(fs.readFileSync(packageJsonPath)).name;
    } else {
        defaultName = sysPath.basename(cwd);
    }

    // TODO
    const proName = defaultName;

    const initTmplPath = sysPath.resolve(__dirname, '../config/initTmpl/');
    let writePackageJsonStream;

    // 如果没有package.json，先添加package.json
    if (!fileExists(packageJsonPath)) {
        writePackageJsonStream = createPackageJson();
    }

    if (!writePackageJsonStream) {
        createConfigFile();
    } else {
        writePackageJsonStream.on('finish', () => {
            log('Successfully created package.json file in ' + cwd);

            createConfigFile();
        });
    }

    function createPackageJson() {
        return fs.createReadStream(sysPath.resolve(initTmplPath, 'package.json')).pipe(replaceStream('#_name', proName)).pipe(fs.createWriteStream(sysPath.resolve(cwd, 'package.json')));
    }

    function createConfigFile() {
        const configFileName = 'ykit.js';

        if (!fileExists('./' + configFileName)) {
            const writeStream = fs.createWriteStream(sysPath.resolve(cwd, configFileName));
            const configFilePath = sysPath.resolve(initTmplPath, 'ykit.common.js');
            const stream = fs.createReadStream(configFilePath).pipe(replaceStream('#_name', proName)).pipe(writeStream);

            stream.on('finish', () => {
                log('Successfully created ' + configFileName + ' file in ' + cwd);
            });
        }
    }
};

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}
