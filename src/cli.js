'use strict';

require('./global');

let Manager = require('./modules/manager.js');

let helpTitle = () => {
    info();
    info('===================== YKit ' + packageJSON.version + ' ====================');
    info();
};

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
    run: (cmdName) => {
        if(cmdName === '-v' || cmdName === '--version') {
            log(packageJSON.version)
            return
        } else if(cmdName === '-h' || cmdName === '--help') {
            cli.help()
            return
        }

        let project = Manager.getProject(process.cwd()),
            cmd = project.commands
            .filter((item) => item.name == cmdName)[0];
        if (!cmd) {
            error('请确认是否存在 ' + cmdName + ' 命令');
            return;
        }
        cmd = cmd.module;
        let options = initOptions(cmd);
        if (options.h || options.help) {
            helpTitle();
            info('命令:', cmdName);
            info('说明:', cmd.usage || '');
            info();
            optimist.showHelp();
            info(' 如果需要帮助, 请使用 ykit {命令名} --help ');
        } else {
            cmd.run.call({project}, options);
        }
    },
    help: () => {
        helpTitle();
         Manager.getProject(process.cwd()).commands
            .forEach((command) => {
                info(' ' + (rightPad(command.name, 15)) + ' # ' + (command.module.usage || ''))
            });
        info();
        info('可用的全局配置有:', (Manager.readRC().configs || []).map((item) => item.name.substring(12)).join(', '));
        info();
        info(' 如果需要帮助, 请使用 ykit {命令名} --help ');
    }
};
