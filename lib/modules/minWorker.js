'use strict';

var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var jsParser = require('uglify-js').parser;
var jsUglify = require('uglify-js').uglify;
var cssUglify = require('uglifycss');

var HASH_PLACEHOLDER = '[hashPlaceholder]';

process.on('message', function (m) {
    var opt = m.opt;
    var cwd = m.cwd;
    var assetName = m.assetName;
    var replacedAssets = [];

    if (/\.js$/.test(assetName) || /\.css$/.test(assetName)) {
        var content = fs.readFileSync(path.resolve(cwd, assetName), { encoding: 'utf8' });
        var minifiedCode = null;

        if (path.extname(assetName) === '.js') {
            // variable name mangling
            var willMangle = true;
            if (typeof opt.min === 'string' && opt.min.split('=')[0] === 'mangle' && opt.min.split('=')[1] === 'false') {
                willMangle = false;
            }
            var ast = jsParser.parse(content);
            ast = willMangle ? jsUglify.ast_mangle(ast) : ast;
            ast = jsUglify.ast_squeeze(ast);
            minifiedCode = jsUglify.gen_code(ast, true);
        } else if (path.extname(assetName) === '.css') {
            minifiedCode = cssUglify.processString(content);
        }

        if (minifiedCode) {
            fs.writeFileSync(path.resolve(cwd, assetName), minifiedCode, { encoding: 'utf8' });

            // 重新生成版本号， webpack 打的样式文件 hash 会根据所在目录不同而不同，造成 beta/prd 环境下版本号不一致
            if (assetName.indexOf(HASH_PLACEHOLDER) > -1) {
                var version = md5(minifiedCode).slice(0, 20); // 和 webpack hash 长度保持一致
                var nextName = assetName.replace(HASH_PLACEHOLDER, version);
                fs.renameSync(path.resolve(cwd, assetName), path.resolve(cwd, nextName));
                replacedAssets = [assetName, nextName];
            } else {
                replacedAssets = [assetName, assetName];
            }
        }
    }

    process.send(replacedAssets);
});

function md5(content) {
    return crypto.createHash('md5').update(content).digest('hex');
}