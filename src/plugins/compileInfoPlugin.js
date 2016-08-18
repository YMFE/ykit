"use strict";

const webpack = require("webpack");
const formatOutput = require('./tools/format-output.js');

function DashboardPlugin(handler) {
    this.logContent = null;
}

DashboardPlugin.prototype.apply = function(compiler) {
    var self = this;
    var handler = function(dataArr) {

        if(self.logContent) {
            return
        }

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
                        if (stats.hasErrors()) {
                            error('Failed');
                        }
                        // self.logText.log(formatOutput(stats));
                        // self.moduleTable.setData(formatModules(stats));
                        // self.assetTable.setData(formatAssets(stats));
                        self.logContent = formatOutput(stats);
                        // console.log(formatModules(stats));
                        // console.log(formatAssets(stats));
                        break;
                    }
                // case 'log':
                //     {
                //         self.logText.log(data.value);
                //         break;
                //     }
                // case 'error':
                //     {
                //         self.logText.log("{red-fg}" + data.value + "{/}");
                //         break;
                //     }
                // case 'clear':
                //     {
                //         self.logText.setContent('');
                //         break;
                //     }
            }
        });

        if(self.logContent) {
            log(self.logContent)
        }
    };

    compiler.apply(new webpack.ProgressPlugin(function(percent, msg) {
        handler.call(null, [{
            type: "status",
            value: "Compiling"
        }, {
            type: "progress",
            value: percent
        }, {
            type: "operations",
            value: msg
        }]);
    }));

    compiler.plugin("compile", function() {
        handler.call(null, [{
            type: "status",
            value: "Compiling"
        }]);
    });

    compiler.plugin("invalid", function() {
        handler.call(null, [{
            type: "status",
            value: "Invalidated"
        }, {
            type: "progress",
            value: 0
        }, {
            type: "operations",
            value: "idle"
        }, {
            type: "clear"
        }]);
    });

    compiler.plugin("done", function(stats) {
        handler.call(null, [{
            type: "status",
            value: "Success"
        }, {
            type: "progress",
            value: 0
        }, {
            type: "operations",
            value: "idle"
        }, {
            type: "stats",
            value: {
                errors: stats.hasErrors(),
                warnings: stats.hasWarnings(),
                data: stats.toJson()
            }
        }]);
    });

    compiler.plugin("failed", function() {
        handler.call(null, [{
            type: "status",
            value: "Failed"
        }, {
            type: "operations",
            value: "idle"
        }]);
    });

}

module.exports = new DashboardPlugin();
