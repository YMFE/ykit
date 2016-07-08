'use strict';

let Project = require('../models/Project.js');

exports.usage = "资源编译、打包";

exports.setOptions = (optimist) => {
    optimist.alias('l', 'lint');
    optimist.describe('l', '先进行验证');
    optimist.alias('m', 'min');
    optimist.describe('m', '压缩/混淆项目文件');
    optimist.alias('s', 'sourcemap');
    optimist.describe('s', '使用sourcemap');
};

exports.run = (options) => {
	var cwd = options.cwd,
        min = options.m || options.min || false,
        lint = options.l || options.lint || false,
        sourcemap = options.s || options.sourcemap || true,
        project = new Project(cwd);

    project.readConfig({
        min: min
    }).pack({
        lint: lint,
        min: min,
        sourcemap: sourcemap
    }, (err, stats) => {
        if(err){
            error(err.red)
        }

        const statsInfo = stats.toJson({errorDetails: false})

        if(statsInfo.errors.length > 0){
            statsInfo.errors.map((err) => {
                error(err.red)
                info()
            })
        }

        // TODO 测试warning情况
        if(statsInfo.warnings.length > 0){
            statsInfo.warnings.map((warning) => {
                warn(err.yellow)
                info()
            })
        }

        statsInfo.assets.map((asset) => {
            const size = asset.size > 1024
                            ? (asset.size / 1024).toFixed(2) + ' kB'
                            : asset.size + ' bytes';

            // .cache文件不显示
            if(!endWith(asset.name, ".cache")){
                log('packed asset: '.gray + asset.name + ' - ' + size )
            }
        })

        success('complete in ' + statsInfo.time + 'ms\n')

        function endWith(string, suffix) {
            return string.indexOf(suffix, string.length - suffix.length) !== -1;
        }
    });
};
