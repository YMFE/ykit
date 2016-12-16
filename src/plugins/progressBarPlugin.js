const webpack = require('webpack');
const logSymbols = require('log-symbols');
const moment = require('moment');

module.exports = new ProgressBarPlugin();

function ProgressBarPlugin() {
    return new webpack.ProgressPlugin(function(percent, msg) {
        if(percent === 0) {
            spinner.text = 'building...';
            spinner.start();
        }

        if(msg) {
            if(msg !== 'emit') {
                spinner.text = '[Bundler] ' + msg;

                if(msg.indexOf('optimize') > -1) {
                    spinner.render();
                }
            } else {
                const dateFormat = 'YY.MM.DD HH:mm:ss';
                spinner.text = '\x1b[90m' + '[' +moment().format(dateFormat) +'] build complete!' + '\x1b[0m';
                spinner.stopAndPersist(logSymbols.info);
                spinner.text = '';
            }
        }
    });
}
