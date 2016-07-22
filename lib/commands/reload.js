'use strict';

var Manager = require('../modules/manager.js');

exports.usage = "重载插件";

exports.run = function (options) {

    Manager.reloadRC();

    success('Complete!');
};