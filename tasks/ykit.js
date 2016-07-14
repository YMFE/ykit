'use strict';

let ykit = require('../src/ykit.js');

module.exports = (grunt) => {
    grunt.registerMultiTask('ykit', 'YKit Pack', () => {
        var cwd = process.cwd(),
            data = this.data || {},
            done = this.async();
        data.cwd = data.cwd || cwd;
        ykit.pack(data, () => {
            this.async();
        })
    });
};
