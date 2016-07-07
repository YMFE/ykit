'use strict';

const reg = /^(@qnpm\/)?(ykit\-(\w+)\-[\w\-]+)$/;

let Manager = require('../modules/manager.js'),
    Project = require('../models/Project.js');

exports.usage = "重载插件";

exports.run = (options) => {
    let root = childProcess.execSync('npm root -g', {
            encoding: 'utf-8'
        }).split('\n')[0],
        modules = globby.sync(['@*' + sysPath.sep + 'ykit-*', 'ykit-*'], {
            cwd: root
        }).map((name) => {
            let mt = name.match(reg);
            if (mt && mt.length == 4) {
                return {
                    name: mt[2],
                    type: mt[3],
                    path: root + sysPath.sep + name
                };
            }
        }).filter((item) => !!item),
        rc = Manager.readRC();

    rc.commands = modules.filter((item) => item.type == 'command');
    rc.configs = modules.filter((item) => item.type == 'config');

    Manager.writeRC(rc);

    success('Complete!');
};
