'use strict';

let Manager = require('../modules/manager.js');

exports.usage = "重载插件";

exports.run = (options) => {

    Manager.reloadRC();

    success('Complete!');
};
