'use strict';

var webpack = require('webpack');
var moment = require('moment');
var formatOutput = require('./tools/formatOutput.js');
var logSymbols = require('log-symbols');

function DashboardPlugin() {}

DashboardPlugin.prototype.apply = function (compiler) {
    // var self = this;
    var handler = function handler(dataArr) {

        dataArr.forEach(function (data) {
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
                            hasErrors: function hasErrors() {
                                return data.value.errors;
                            },
                            hasWarnings: function hasWarnings() {
                                return data.value.warnings;
                            },
                            toJson: function toJson() {
                                return data.value.data;
                            }
                        };

                        var statsInfo = stats.toJson({ errorDetails: false });
                        var dateFormat = 'HH:mm:ss';
                        var dateLog = '[' + moment().format(dateFormat) + ']';

                        if (stats.hasErrors()) {
                            var errLen = statsInfo.errors.length;
                            var logMsg = errLen + ' error' + (errLen > 1 ? 's' : '') + ' in compiling process.';
                            spinner.text = dateLog.grey + ' ' + logMsg.red;
                            spinner.fail();
                            spinner.text = '';
                        }

                        if (stats.hasWarnings()) {
                            var warnLen = statsInfo.warnings.length;
                            var _logMsg = warnLen + ' warning' + (warnLen > 1 ? 's' : '') + ' in compiling process.';
                            spinner.text = dateLog.grey + ' ' + _logMsg.yellow;
                            spinner.stopAndPersist(logSymbols.warning);
                            spinner.text = '';
                        }

                        formatOutput(stats);

                        break;
                    }
            }
        });
    };

    compiler.apply(new webpack.ProgressPlugin(function (percent, msg) {
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

    compiler.plugin('compile', function () {
        handler.call(null, [{
            type: 'status',
            value: 'Compiling'
        }]);
    });

    compiler.plugin('invalid', function () {
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

    compiler.plugin('done', function (stats) {
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
                data: stats.toJson({ errorDetails: false })
            }
        }]);
    });

    compiler.plugin('failed', function () {
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