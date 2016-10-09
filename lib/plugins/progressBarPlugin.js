'use strict';

var webpack = require('webpack');
var colors = require('colors/safe');

module.exports = new ProgressBarPlugin();

function ProgressBarPlugin() {
    var stream = process.stderr;

    return new webpack.ProgressPlugin(function (percent, msg) {
        if (stream) {
            stream.clearLine && stream.clearLine();
            stream.cursorTo && stream.cursorTo(0);
            if (msg && stream.write) {
                stream.write(colors.grey('[Bundler] ') + colors.green(msg));
            }
        }
    });
};