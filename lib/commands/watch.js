'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var fs = require('fs');
var colors = require('colors');
var webpack = require('webpack');
var moment = require('moment');

var Manager = require('../modules/manager.js');
var UtilFs = require('../utils/fs.js');
var UtilPath = require('../utils/path.js');

exports.usage = '监控目录';
exports.abbr = 'w';

exports.setOptions = function (optimist) {
    // optimist.alias('v', 'verbose');
    // optimist.describe('v', '显示详细编译信息');
};

exports.run = function (options) {
    // const verbose = options.v || options.verbose;

    var cwd = process.cwd();
    var project = Manager.getProject(cwd, { cache: false });
    var compiler = project.getServerCompiler(function (config) {
        config.plugins.push(require('../plugins/progressBarPlugin.js'));
        config.plugins.push(require('../plugins/compileInfoPlugin.js'));
        return config;
    });

    compiler.watch({
        aggregateTimeout: 300 // wait so long for more changes
    }, function (err, stats) {
        var dateFormat = 'HH:mm:ss';

        if (!stats.hasErrors() && !stats.hasWarnings()) {
            var minDuration = 100;
            if (stats.endTime - stats.startTime > minDuration) {
                var dateLog = '[' + moment().format(dateFormat) + ']';
                var successText = ' Compiled successfully in ' + (stats.endTime - stats.startTime) + 'ms.';
                spinner.text = dateLog.grey + successText.green;
                spinner.succeed();
            }
        }
        spinner.stop();
        spinner.text = '';

        // asset info output
        var outputAssets = [];
        (0, _keys2.default)(stats.compilation.assets).map(function (key) {
            var assetPath = stats.compilation.assets[key].existsAt;
            var assetName = path.relative(cwd, assetPath);
            if (path.extname(assetPath) !== '.map') {
                outputAssets.push({
                    name: assetName,
                    size: UtilFs.getFileSize(assetPath)
                });
            }
        });

        logPlain(colors.bold('Emitted assets:'));
        outputAssets.map(function (asset, index) {
            logPlain((index + 1 + '.').grey + (' ' + colors.bold(asset.name.green) + ' (' + asset.size + ')'));
        });
        logPlain('Waiting to compile...\n'.grey);
    });
};