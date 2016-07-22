'use strict';

var Manager = require('../modules/manager.js');

exports.usage = "代码质量检测";

exports.setOptions = function (optimist) {
    optimist.alias('d', 'dir');
    optimist.describe('d', '检测特定目录/文件');
};

exports.run = function (options) {
    var cwd = options.cwd,
        project = this.project,
        dir = options.d || options.dir;

    async.series([function (callback) {
        return project.lint(dir, callback);
    }, function (callback) {
        return project.lintCss(dir, callback);
    }], function (err, results) {
        if (!err) {
            if (results[0] && results[1]) {
                success('All files complete without error.');
            }
        } else if (err === true) {
            error('Lint Error！');
        } else {
            error(err);
        }
    });
};