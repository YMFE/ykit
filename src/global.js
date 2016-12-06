'use strict';

require('colors');
const moment = require('moment');
const logSymbols = require('log-symbols');

global.spinner = require('./utils/ora')();
global.fs = require('fs');
global.sysPath = require('path');
global.async = require('async');
global.childProcess = require('child_process');
global.leftPad = require('left-pad');
global.rightPad = require('right-pad');
global.globby = require('globby');
global.optimist = require('optimist');
global.JSON5 = require('json5');
global.loaderUtils = require('loader-utils');
global.extend = require('extend');
global.yaml = require('js-yaml');
global.requireUncached = require('require-uncached');
global.mkdirp = require('mkdirp');

global.USER_HOME = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
global.YKIT_HOME = sysPath.join(USER_HOME, '.ykit');
global.YKIT_RC = sysPath.join(USER_HOME, '.ykitrc');
global.YKIT_COMMANDS_PATH = sysPath.join(__dirname, 'commands');
global.YKIT_COMPILERS_PATH = sysPath.join(__dirname, 'compilers');

global.info = console.info; // eslint-disable-line
global.success = function() {
    info((' √ ' + Array.prototype.join.call(arguments, ' ')).green);
};
global.error = function() {
    info((' X ' + Array.prototype.join.call(arguments, ' ')).red);
};
global.warn = function() {
    info((' ∆ ' + Array.prototype.join.call(arguments, ' ')).yellow);
};
global.log = function() {
    info(('[YKit] ').gray + Array.prototype.join.call(arguments, ' '));
};
global.logTime = function() {
    info(logSymbols.info + (' [' + moment().format('YY.MM.DD HH:mm:ss') + '] ').gray + Array.prototype.join.call(arguments, ' '));
};
global.packageJSON = require('../package.json');
