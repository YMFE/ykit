'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('./global');
var version = require('../package.json').version;
var optimist = require('optimist');
var rightPad = require('right-pad');
var buildCmd = require('./commands/build');
var UtilFs = require('./utils/fs.js');

var Manager = require('./modules/manager.js');

var helpTitle = '\n===================== YKit ' + version + ' ====================\n';

var initOptions = function initOptions(cmd) {
    if (cmd.setOptions) {
        cmd.setOptions(optimist);
    } else if (cmd.set_options) {
        cmd.set_options(optimist);
    }
    optimist.alias('h', 'help');
    optimist.describe('h', '查看帮助');
    var options = optimist.argv;
    options.cwd = process.cwd();
    return options;
};

var cli = module.exports = {
    run: function run(option) {
        // 如果不存在全局配置文件，首先创建一个
        if (!UtilFs.fileExists(YKIT_RC) && !process.env['SUDO_UID']) {
            var initRc = {
                /* eslint-disable */
                "commands": [],
                "configs": []
                /* eslint-enable */
            };
            fs.writeFileSync(YKIT_RC, (0, _stringify2.default)(initRc, null, '    '));
        }

        // build 命令提前 npm install
        if (process.argv[2] === 'build') {
            var ykitOptions = require(sysPath.join(process.cwd(), 'package.json')).ykit || {};
            if (ykitOptions.skipBuilding) {
                logInfo('Skip building.');
                return;
            } else {
                buildCmd.npmInstall();
            }
        }

        // 处理辅助命令
        if (option === '-v' || option === '--version') {
            log(version);
            return;
        } else if (option === '-h' || option === '--help' || !option) {
            cli.help();
            return;
        }

        // 处理核心命令
        var project = Manager.getProject(process.cwd());
        var command = project.commands.filter(function (command) {
            return command.name === option || command.abbr === option;
        })[0];
        if (!command) {
            error('Command ' + option + ' not found.');
            return;
        }
        var module = command.module;
        var options = initOptions(module);
        if (options.h || options.help) {
            info(helpTitle);
            info('命令:', option);
            info('说明:', module.usage || '');
            info();
            optimist.showHelp();
            info(' 如果需要帮助, 请使用 ykit {命令名} --help ');
        } else {
            var cmdPlugin = '';
            project.plugins.map(function (plugin) {
                var isCmdBelongToPlugin = typeof plugin === 'string' ? plugin === command.pluginName : plugin.name === command.pluginName || 'ykit-config-' + plugin.name === command.pluginName || '@qnpm/ykit-config-' + plugin.name === command.pluginName;
                cmdPlugin = plugin;
            });

            module.run.call({
                project: project,
                plugin: cmdPlugin
            }, options);
        }
    },
    help: function help() {
        info(helpTitle);
        Manager.getProject(process.cwd()).commands.forEach(function (command) {
            if (command.name !== 'build') {
                var commandStr = rightPad(rightPad(command.name, 12) + (command.abbr || ''), 25);
                info(' ' + commandStr + ' # ' + (command.module.usage || ''));
            }
        });
        info();
        info(' 如果需要帮助, 请使用 ykit {命令名} --help\n');
    }
};