'use strict';

require('./global');
const version = require('../package.json').version;
const optimist = require('optimist');
const rightPad = require('right-pad');
const buildCmd = require('./commands/build');
const UtilFs = require('./utils/fs.js');

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
        // 如果不存在全局配置文件，首先创建一个
        if(!UtilFs.fileExists(YKIT_RC) && !process.env['SUDO_UID']) {
            const initRc = {
                /* eslint-disable */
                "commands": [],
                "configs": []
                /* eslint-enable */
            };
            fs.writeFileSync(YKIT_RC, JSON.stringify(initRc, null, '    '));
        }

        // build 命令提前 npm install
        if(process.argv[2] === 'build') {
            const ykitOptions = require(sysPath.join(process.cwd(), 'package.json')).ykit || {};
            if(ykitOptions.skipBuilding) {
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
        let project = Manager.getProject(process.cwd());
        let command = project.commands.filter((command) => command.name === option || command.abbr === option)[0];
        if (!command) {
            error('Command ' + option + ' not found.');
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
            let cmdPlugin = '';
            project.plugins.map((plugin) => {
                const isCmdBelongToPlugin = typeof plugin === 'string'
                                            ? plugin === command.pluginName
                                            : plugin.name === command.pluginName
                                                || 'ykit-config-' + plugin.name === command.pluginName
                                                || '@qnpm/ykit-config-' + plugin.name === command.pluginName;
                cmdPlugin = plugin;
            });

            module.run.call({
                project,
                plugin: cmdPlugin
            }, options);
        }
    },
    help: () => {
        info(helpTitle);
        Manager.getProject(process.cwd()).commands.forEach((command) => {
            if(command.name !== 'build') {
                const commandStr = rightPad(rightPad(command.name, 12) + (command.abbr || ''), 25);
                info(` ${commandStr} # ${command.module.usage || ''}`);
            }
        });
        info();
        info(' 如果需要帮助, 请使用 ykit {命令名} --help\n');
    }
};
