const webpack = require('webpack');
const logSymbols = require('log-symbols');
const moment = require('moment');

module.exports = new ProgressBarPlugin();

function ProgressBarPlugin() {
    let startTime = null;
    let endTime = null;
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
