'use strict';

var path = require('path');
var fs = require('fs');
var jsParser = require('uglify-js').parser;
var jsUglify = require('uglify-js').uglify;
var cssUglify = require('uglifycss');

process.on('message', function (m) {
    var opt = m.opt;
    var cwd = m.cwd;
    var assetName = m.assetName;

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

        minifiedCode && fs.writeFileSync(path.resolve(cwd, assetName), minifiedCode, { encoding: 'utf8' });
    }

    process.send('complete');
});