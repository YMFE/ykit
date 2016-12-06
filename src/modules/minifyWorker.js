const path = require('path');
const fs = require('fs');
const jsParser = require('uglify-js').parser;
const jsUglify = require('uglify-js').uglify;
const cssUglify = require('uglifycss');

process.on('message', function(m) {
    const opt = m.opt;
    const cwd = m.cwd;
    const assetName = m.assetName;

    if(/\.js$/.test(assetName) || /\.css$/.test(assetName)) {
        const content = fs.readFileSync(path.resolve(cwd, assetName), {encoding: 'utf8'});
        let minifiedCode = null;

        if(path.extname(assetName) === '.js') {
            // variable name mangling
            let willMangle = true;
            if (typeof opt.min === 'string' && opt.min.split('=')[0] === 'mangle' && opt.min.split('=')[1] === 'false') {
                willMangle = false;
            }
            let ast = jsParser.parse(content);
            ast = willMangle ? jsUglify.ast_mangle(ast) : ast;
            ast = jsUglify.ast_squeeze(ast);
            minifiedCode = jsUglify.gen_code(ast, true);
        } else if (path.extname(assetName) === '.css') {
            minifiedCode = cssUglify.processString(content);
        } 

        minifiedCode && fs.writeFileSync(path.resolve(cwd, assetName), minifiedCode, {encoding: 'utf8'});
    }

    process.send('complete');
});
