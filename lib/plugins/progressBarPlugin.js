'use strict';

var webpack = require('webpack');

module.exports = new ProgressBarPlugin();

function ProgressBarPlugin() {
    return new webpack.ProgressPlugin(function (percent, msg) {
        spinner.start();

        if (msg) {
            spinner.text = '[Bundler] ' + msg;
            if(msg === 'emit') {
                setTimeout(() => {
                    spinner.stop().clear();
                }, 100)
            }
        }
    });
}
