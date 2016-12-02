'use strict';

require('./global');
const version = require('../package.json').version;
const optimist = require('optimist');
const rightPad = require('right-pad');

let Manager = require('./modules/manager.js');

let helpTitle = `\n===================== YKit ${version} ====================\n`;

let initOptions = (cmd) => {
    if (cmd.setOptions) {
        cmd.setOptions(optimist);
    } else if (cmd.set_options) {
        cmd.set_options(optimist);
    }
    optimist.alias('h', 'help');
    optimist.describe('h', '查看帮助');
    let options = optimist.argv;
    options.cwd = process.cwd();
    return options;
};

let cli = module.exports = {
    run: (option) => {
        if (option === '-v' || option === '--version') {
            log(version);
            return;
        } else if (option === '-h' || option === '--help' || !option) {
            cli.help();
            return;
        }

        let project = Manager.getProject(process.cwd());
        let command = project.commands.filter((command) => command.name === option || command.abbr === option)[0];
        if (!command) {
            error('请确认是否存在 ' + option + ' 命令');
            return;
        }
        let module = command.module;
        let options = initOptions(module);
        if (options.h || options.help) {
            info(helpTitle);
            info('命令:', option);
            info('说明:', module.usage || '');
            info();
            optimist.showHelp();
            info(' 如果需要帮助, 请使用 ykit {命令名} --help ');
        } else {
            module.run.call({project}, options);
        }
    },
    help: () => {
        info(helpTitle);
        Manager.getProject(process.cwd()).commands.forEach((command) => {
            info(` ${rightPad(command.name, 8)} ${rightPad(command.abbr, 26)} # ${command.module.usage || ''}`);
        });
        info();
        info(' 可用的全局配置有:', (Manager.readRC().configs || []).map((item) => item.name.substring(12)).join(', '));
        info();
        info(' 如果需要帮助, 请使用 ykit {命令名} --help\n');
    }
};
