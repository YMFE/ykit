'use strict';

require('./global.js');

var through = require('through2'),
    Project = require('./models/Project.js');

var ykit = module.exports = function (options) {
    options = options || {};
    return through.obj(function (file, enc, cb) {
        var cwd = file.cwd;
        new Project(cwd).pack(options, function () {
            cb();
        });
    });
};

ykit.pack = function (options, cb) {
    options = options || {};
    var cwd = options.cwd || process.cwd();
    new Project(cwd).pack(options, cb);
};