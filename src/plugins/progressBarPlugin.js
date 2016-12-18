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

                if (msg.indexOf('optimize') > -1) {
                    spinner.render();
                }
            } else {
                endTime = Date.now();
                const dateFormat = 'YY.MM.DD HH:mm:ss';
                spinner.text = '\x1b[90m' + '[' + moment().format(dateFormat) + '] build complete in ' + (endTime - startTime) + 'ms.';
                spinner.stopAndPersist(logSymbols.info);
                spinner.text = '';
            }
        }
    });
}
