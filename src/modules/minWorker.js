const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const jsParser = require('uglify-js').parser;
const jsUglify = require('uglify-js').uglify;
const cssUglify = require('uglifycss');

const HASH_PLACEHOLDER = '[hashPlaceholder]';

process.on('message', function(m) {
    const opt = m.opt;
    const cwd = m.cwd;
    const assetName = m.assetName;
    let replacedAssets = [];

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

        if(minifiedCode) {
            fs.writeFileSync(path.resolve(cwd, assetName), minifiedCode, {encoding: 'utf8'});

            // 重新生成版本号， webpack 打的样式文件 hash 会根据所在目录不同而不同，造成 beta/prd 环境下版本号不一致
            if(assetName.indexOf(HASH_PLACEHOLDER) > -1) {
                const version = md5(minifiedCode).slice(0, 16);
                const nextName = assetName.replace(HASH_PLACEHOLDER, version);
                fs.renameSync(path.resolve(cwd, assetName), path.resolve(cwd, nextName));
                replacedAssets = [assetName, nextName];
            }
        }
    }

    process.send(replacedAssets);
});

function md5(content) {
    return crypto.createHash('md5').update(content).digest('hex');
}
