'use strict';

const async = require('async');

exports.usage = '代码质量检测';
exports.abbr = 'l';

exports.setOptions = (optimist) => {
    optimist.alias('d', 'dir');
    optimist.describe('d', '检测特定目录/文件');
};

exports.run = function (options)  {
    let project = this.project,
        dir = options.d || options.dir;

    const lintFuncs = [
        // 暂时只 lint js
        function(callback) {
            project.lint(dir, callback);
        }
    ];

    async.series(lintFuncs, (err, results) => {
        if (!err) {
            if (results[0] && results[1]) {
                success('All files complete without error.');
                process.exit(0);
            } else {
                process.exit(1);
            }
        } else if (err === true) {
            error('Lint Error');
            process.exit(1);
        } else {
            error(err);
        }
    });
};
