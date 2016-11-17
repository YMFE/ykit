'use strict';

require('./global.js');


let through = require('through2'),
    Project = require('./models/Project.js');

let ykit = module.exports = (options) => {
    options = options || {};
    return through.obj(function(file, enc, cb) {
        let cwd = file.cwd;
        new Project(cwd).pack(options, function() {
            cb();
        });
    });
};

ykit.pack = (options, cb) => {
    options = options || {};
    let cwd = options.cwd || process.cwd();
    new Project(cwd).pack(options, cb);
};
