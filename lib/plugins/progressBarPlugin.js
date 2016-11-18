'use strict';

var webpack = require('webpack');

module.exports = new ProgressBarPlugin();

function ProgressBarPlugin() {
    return new webpack.ProgressPlugin(function (percent, msg) {
        if (percent === 0) {
            spinner.start();
        } else if (msg === 'emit') {
            spinner.stop();
        }

        if (msg) {
            spinner.text = '[Bundler] ' + msg;
        }
    });
}