'use strict';

const path = require('path');
const fs = require('fs');
const colors = require('colors');
const webpack = require('webpack');
const moment = require('moment');

const Manager = require('../modules/manager.js');
const UtilFs = require('../utils/fs.js');
const UtilPath = require('../utils/path.js');

exports.usage = '监控目录';
exports.abbr = 'w';

exports.setOptions = (optimist) => {
    // optimist.alias('v', 'verbose');
    // optimist.describe('v', '显示详细编译信息');
};

exports.run = function (options) {
    // const verbose = options.v || options.verbose;

    const cwd = process.cwd();
    const project = Manager.getProject(cwd, { cache: false });
    const compiler = project.getServerCompiler(function (config) {
        config.plugins.push(require('../plugins/progressBarPlugin.js'));
        config.plugins.push(require('../plugins/compileInfoPlugin.js'));
        return config;
    });

    compiler.watch({
        aggregateTimeout: 300 // wait so long for more changes
    }, function(err, stats) {
        const dateFormat = 'HH:mm:ss';

        if(!stats.hasErrors() && !stats.hasWarnings()) {
            const minDuration = 100;
            if(stats.endTime - stats.startTime > minDuration) {
                const dateLog = '[' + moment().format(dateFormat) + ']';
                const successText =  ' Compiled successfully in ' + (stats.endTime - stats.startTime) + 'ms.';
                spinner.text = dateLog.grey + successText.green;
                spinner.succeed();
            }
        }
        spinner.stop();
        spinner.text = '';

        // asset info output
        let outputAssets = [];
        Object.keys(stats.compilation.assets).map((key) => {
            const assetPath = stats.compilation.assets[key].existsAt;
            const assetName = path.relative(cwd, assetPath);
            if(path.extname(assetPath) !== '.map') {
                outputAssets.push({
                    name: assetName,
                    size: UtilFs.getFileSize(assetPath)
                });
            }
        });

        logPlain(colors.bold('Emitted assets:'));
        outputAssets.map((asset, index) => {
            logPlain(
                `${index + 1}.`.grey
                + ` ${colors.bold(asset.name.green)} (${asset.size})`
            );
        });
        logPlain('Waiting to compile...\n'.grey);
    });
};
