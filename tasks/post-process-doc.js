'use strict';

var fs = require('fs-extra');
var util = require('util');
var path = require('path');
var shell = require('shelljs');
var replaceStream = require('replacestream');

var docsPath = './docs/dist/';
var indexPath = docsPath + 'index.html';
var tempIndexPath = docsPath + 'index_temp.html';

var timeout = null;
var child = shell.exec(
    `npm show ykit version --registry http://registry.npm.taobao.org`,
    {silent: true},
    (code, stdout, stderr) => {
        if(stdout) {
            var stream = fs.createReadStream(indexPath)
                .pipe(replaceStream('#VERSION#', stdout.trim(), {ignoreCase: false}))
                .pipe(fs.createWriteStream(tempIndexPath));

            stream.on('finish', () => {
                fs.removeSync(indexPath);
                fs.move(tempIndexPath, indexPath, function (err) {
                    if (err) return console.error(err);
                    console.log("Post process doc succeed!\n");
                })
            });
        }
        clearTimeout(timeout);
    }
);

// 防止超时
timeout = setTimeout(() => {
    child.kill('SIGINT');
}, 20000);
