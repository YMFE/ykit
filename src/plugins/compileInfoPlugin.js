'use strict';

const webpack = require('webpack');
const moment = require('moment');
const formatOutput = require('./tools/formatOutput.js');
const logSymbols = require('log-symbols');

function DashboardPlugin() {

}

DashboardPlugin.prototype.apply = function(compiler) {
    // var self = this;
    var handler = function(dataArr) {

        dataArr.forEach(function(data) {
            switch (data.type) {
                // case 'progress':
                //     {
                //         var percent = parseInt(data.value * 100);
                //         if (self.minimal) {
                //             percent && self.progress.setContent(percent.toString() + '%');
                //         } else {
                //             self.progressbar.setProgress(percent);
                //         }
                //         break;
                //     }
                // case 'operations':
                //     {
                //         self.operations.setContent(data.value);
                //         break;
                //     }
                // case 'status':
                //     {
                //         var content;
                //
                //         switch (data.value) {
                //             case 'Success':
                //                 content = '{green-fg}{bold}' + data.value + '{/}';
                //                 break;
                //             case 'Failed':
                //                 content = '{red-fg}{bold}' + data.value + '{/}';
                //                 break;
                //             default:
                //                 content = '{white-fg}{bold}' + data.value + '{/}';
                //         }
                //         // self.status.setContent(content);
                //         console.log(content);
                //         break;
                //     }
            case 'stats':
                {
                    var stats = {
                        hasErrors: function() {
                            return data.value.errors;
                        },
                        hasWarnings: function() {
                            return data.value.warnings;
                        },
                        toJson: function() {
                            return data.value.data;
                        }
                    };

                    const statsInfo = stats.toJson({ errorDetails: false });
                    const dateFormat = 'HH:mm:ss';
                    const dateLog = '[' + moment().format(dateFormat) + ']';

                    if (stats.hasErrors()) {
                        const logMsg = 'Failed to compile with ' + statsInfo.errors.length + ' errors.';
                        spinner.text = dateLog.grey + ' ' + logMsg.red;
                        spinner.fail();
                        spinner.text = '';
                    }

                    if (stats.hasWarnings()) {
                        const logMsg = 'Compile with ' + statsInfo.warnings.length + ' warnings.';
                        spinner.text = dateLog.grey + ' ' + logMsg.yellow;
                        spinner.stopAndPersist(logSymbols.warning);
                        spinner.text = '';
                    }

                    if(formatOutput(stats)) {
                        console.log(formatOutput(stats)); // eslint-disable-line
                    }

                    break;
                }
            }
        });
    };

    compiler.apply(new webpack.ProgressPlugin(function(percent, msg) {
        handler.call(null, [{
            type: 'status',
            value: 'Compiling'
        }, {
            type: 'progress',
            value: percent
        }, {
            type: 'operations',
            value: msg
        }]);
    }));

    compiler.plugin('compile', function() {
        handler.call(null, [{
            type: 'status',
            value: 'Compiling'
        }]);
    });

    compiler.plugin('invalid', function() {
        handler.call(null, [{
            type: 'status',
            value: 'Invalidated'
        }, {
            type: 'progress',
            value: 0
        }, {
            type: 'operations',
            value: 'idle'
        }, {
            type: 'clear'
        }]);
    });

    compiler.plugin('done', function(stats) {
        handler.call(null, [{
            type: 'status',
            value: 'Success'
        }, {
            type: 'progress',
            value: 0
        }, {
            type: 'operations',
            value: 'idle'
        }, {
            type: 'stats',
            value: {
                errors: stats.hasErrors(),
                warnings: stats.hasWarnings(),
                data: stats.toJson({errorDetails: false})
            }
        }]);
    });

    compiler.plugin('failed', function() {
        handler.call(null, [{
            type: 'status',
            value: 'Failed'
        }, {
            type: 'operations',
            value: 'idle'
        }]);
    });

};

module.exports = new DashboardPlugin();
