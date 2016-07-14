'use strict';

exports.usage = "重载插件";

exports.run = (options) => {

    Manager.reloadRC();

    success('Complete!');
};
