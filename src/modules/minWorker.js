const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const jsParser = require('uglify-js').parser;
const jsUglify = require('uglify-js').uglify;
const cssUglify = require('uglifycss');
const extend = require('extend');
const colors = require('colors');
const beautify = require('js-beautify').js_beautify;

const HASH_PLACEHOLDER = '[hashPlaceholder]';

process.on('message', function(m) {
    const opt = m.opt;
    const cwd = m.cwd;
    const buildOpts = m.buildOpts;
    const assetName = m.assetName;
    let response = {};

    if(/\.js$/.test(assetName) || /\.css$/.test(assetName)) {
        const filePath = path.resolve(cwd, assetName);
        const content = fs.readFileSync(filePath, {encoding: 'utf8'});
        let minifiedCode = null;

        if(path.extname(assetName) === '.js') {
            // variable name mangling
            let willMangle = true;
            const uglifyjsOpts = buildOpts.uglifyjs || {};
            const isCliArgvCloseMangle = typeof opt.min === 'string' && opt.min.split('=')[0] === 'mangle' && opt.min.split('=')[1] === 'false';
            const isBuildOptsCloseMangle = uglifyjsOpts.mangle === false;
            if (isCliArgvCloseMangle || isBuildOptsCloseMangle) {
                willMangle = false;
            }

            try {
                let ast = jsParser.parse(content);
                ast = willMangle ? jsUglify.ast_mangle(ast, uglifyjsOpts.mangle) : ast;
                ast = uglifyjsOpts.squeeze ? jsUglify.ast_squeeze(ast, uglifyjsOpts.squeeze) : ast;
                minifiedCode = jsUglify.gen_code(ast, uglifyjsOpts.genCode);
            } catch(e) {
                var type = typeof e.line;
                
                if(e.line) {
                    const lineRange = 5;
                    let errorSource = '';
                    for(let lineIndex = e.line - lineRange, lineMax = e.line + lineRange; lineIndex < lineMax; lineIndex++){
                        get_line(filePath, lineIndex, function(err, line) {
                            if(line != null)errorSource += line.trim() + '\n';
                        });
                    }

                    errorSource = beautify(errorSource, {indent_size: 4});
                    errorSource = errorSource.split('\n').map((codeLine, index) => {
                        return codeLine = `line: ${e.line + index}    `.grey + codeLine.red + '\n';
                    }).join('');

                    response.error = extend(true, e, {
                        assetName: assetName,
                        errorSource: errorSource
                    });
                } else {
                    /* eslint-disable no-console */
                    console.error(e);
                    /* eslint-enable no-console */
                }
            }

        } else if (path.extname(assetName) === '.css') {
            const uglifycssOpts = buildOpts.uglifycss || {};
            minifiedCode = cssUglify.processString(content, uglifycssOpts);
        }

        if(minifiedCode) {
            fs.writeFileSync(path.resolve(cwd, assetName), minifiedCode, {encoding: 'utf8'});

            // 重新生成版本号， webpack 打的样式文件 hash 会根据所在目录不同而不同，造成 beta/prd 环境下版本号不一致
            if(assetName.indexOf(HASH_PLACEHOLDER) > -1) {
                const version = md5(minifiedCode).slice(0, 20); // 和 webpack hash 长度保持一致
                const nextName = assetName.replace(HASH_PLACEHOLDER, version);
                fs.renameSync(path.resolve(cwd, assetName), path.resolve(cwd, nextName));
                response.replacedAssets = [assetName, nextName];
            } else {
                response.replacedAssets = [assetName, assetName];
            }
        }
    }

    process.send(response);
});

function get_line(filename, line_no, callback) {

    var data = fs.readFileSync(filename, 'utf8');
    var lines = data.split('\n');
    if(+line_no > lines.length) {
        throw new Error('File end reached without finding line');
    }

    callback(null, lines[+line_no]);
}

function md5(content) {
    return crypto.createHash('md5').update(content).digest('hex');
}
