'use strict';

require('colors');

global.fs = require('fs');
global.sysPath = require('path');
global.childProcess = require('child_process');
global.leftPad = require('left-pad');
global.rightPad = require('right-pad');
global.globby = require('globby');
global.optimist = require('optimist');

global.USER_HOME = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
global.NPM_ROOT = childProcess.execSync('npm root -g', {encoding: 'utf-8'}).split('\n')[0];
global.MODULES_ROOT = childProcess.execSync('npm root', {encoding: 'utf-8'}).split('\n')[0];
global.YKIT_HOME = sysPath.join(USER_HOME, '.ykit');
global.YKIT_RC = sysPath.join(USER_HOME, '.ykitrc');
global.YKIT_PROJECT_MODULES = globby.sync(['@*' + sysPath.sep + 'ykit-*', 'ykit-*'], {cwd : MODULES_ROOT}).map((name) => MODULES_ROOT + sysPath.sep + name);
global.YKIT_GLOBAL_MODULES = globby.sync(['@*' + sysPath.sep + 'ykit-*', 'ykit-*'], {cwd : NPM_ROOT}).map((name) => NPM_ROOT + sysPath.sep + name);
global.YKIT_COMMANDS_PATH = sysPath.join(__dirname, 'commands');
global.YKIT_COMPILERS_PATH = sysPath.join(__dirname, 'compilers');

global.info = console.info;
global.success = function() {
    info((' √ ' + Array.prototype.join.call(arguments, ' ')).green);
}
global.error = function() {
    info((' X ' + Array.prototype.join.call(arguments, ' ')).red);
}
global.warn = function() {
    info((' ∆ ' + Array.prototype.join.call(arguments, ' ')).yellow);
}
global.packageJSON = require('../package.json');
