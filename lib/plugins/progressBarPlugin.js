'use strict';

var webpack = require('webpack');
var logSymbols = require('log-symbols');
var moment = require('moment');

module.exports = new ProgressBarPlugin();

function ProgressBarPlugin() {
    var startTime = null;
    var endTime = null;
    return new webpack.ProgressPlugin(function (percent, msg) {
        if (percent === 0) {
            spinner.text = 'building...';
            spinner.start();
            startTime = Date.now();
        }

        if (msg) {
            if (msg !== 'emit') {
                spinner.text = '[Bundler] ' + msg;
            }
        }
    });
}