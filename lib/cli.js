'use strict';

require('./global');
var version = require('../package.json').version;
var optimist = require('optimist');
var rightPad = require('right-pad');

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
        if (option === '-v' || option === '--version') {
            log(version);
            return;
        } else if (option === '-h' || option === '--help' || !option) {
            cli.help();
            return;
        }

        var project = Manager.getProject(process.cwd());
        var command = project.commands.filter(function (command) {
            return command.name === option || command.abbr === option;
        })[0];
        if (!command) {
            error('请确认是否存在 ' + option + ' 命令');
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
            module.run.call({ project: project }, options);
        }
    },
    help: function help() {
        info(helpTitle);
        Manager.getProject(process.cwd()).commands.forEach(function (command) {
            info(' ' + rightPad(command.name, 8) + ' ' + rightPad(command.abbr, 26) + ' # ' + (command.module.usage || ''));
        });
        info();
        info(' 可用的全局配置有:', (Manager.readRC().configs || []).map(function (item) {
            return item.name.substring(12);
        }).join(', '));
        info();
        info(' 如果需要帮助, 请使用 ykit {命令名} --help\n');
    }
};