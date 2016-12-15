'use strict';

exports.usage = '操作全局配置';
exports.abbr = 'c';

exports.setOptions = function () {};

exports.run = function () {
    var operation = process.argv[3];

    var globalConfig = JSON.parse(fs.readFileSync(YKIT_RC, { encoding: 'utf8' }));

    if (operation === 'list') {
        log('config file path: ' + YKIT_RC + '\n');
        log('global configs');

        Object.keys(globalConfig).forEach(function (configKey) {
            if (configKey !== 'commands' && configKey !== 'configs') {
                log(rightPad(configKey, 6) + ' = ' + globalConfig[configKey]);
            }
        });

        process.exit(0);
    }

    if (operation === 'set') {
        var settingKey = process.argv[4];
        var settingValue = process.argv[5];

        if (settingKey && settingValue) {
            globalConfig[settingKey] = settingValue;
            fs.writeFileSync(YKIT_RC, JSON.stringify(globalConfig, null, '  '), { encoding: 'utf8' });
            process.exit(0);
        }
    }

    error('缺少参数或参数有误，命令格式为: ');
    error('ykit config list');
    error('ykit config set <key> <value>\n');
    process.exit(1);
};