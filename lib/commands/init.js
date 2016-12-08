'use strict';

var replaceStream = require('replacestream');
var Manager = require('../modules/manager.js');

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

    if (fileExists(packageJsonPath)) {
        defaultName = JSON.parse(fs.readFileSync(packageJsonPath)).name;
    } else {
        defaultName = sysPath.basename(cwd);
    }

    // TODO
    var proName = defaultName;

    var initTmplPath = sysPath.resolve(__dirname, '../config/initTmpl/');
    var writePackageJsonStream = void 0;

    // 如果没有package.json，先添加package.json
    if (!fileExists(packageJsonPath)) {
        writePackageJsonStream = createPackageJson();
    }

    if (!writePackageJsonStream) {
        createConfigFile();
    } else {
        writePackageJsonStream.on('finish', function () {
            log('Successfully created package.json file in ' + cwd);

            createConfigFile();
        });
    }

    function createPackageJson() {
        return fs.createReadStream(sysPath.resolve(initTmplPath, 'package.json')).pipe(replaceStream('#_name', proName)).pipe(fs.createWriteStream(sysPath.resolve(cwd, 'package.json')));
    }

    function createConfigFile() {
        var configFileName = 'ykit.js';

        if (!fileExists('./' + configFileName)) {
            var writeStream = fs.createWriteStream(sysPath.resolve(cwd, configFileName));
            var configFilePath = sysPath.resolve(initTmplPath, 'ykit.js');
            var stream = fs.createReadStream(configFilePath).pipe(replaceStream('#_name', proName)).pipe(writeStream);

            stream.on('finish', function () {
                log('Successfully created ' + configFileName + ' in ' + cwd);
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