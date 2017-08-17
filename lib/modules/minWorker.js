'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var jsParser = require('uglify-js').parser;
var jsUglify = require('uglify-js').uglify;
var cssUglify = require('uglifycss');
var extend = require('extend');
var colors = require('colors');
var beautify = require('js-beautify').js_beautify;

var HASH_PLACEHOLDER = '[hashPlaceholder]';

process.on('message', function (m) {
    var opt = m.opt;
    var cwd = m.cwd;
    var buildOpts = m.buildOpts;
    var assetName = m.assetName;
    var response = {};

    if (/\.js$/.test(assetName) || /\.css$/.test(assetName)) {
        var filePath = path.resolve(cwd, assetName);
        var content = fs.readFileSync(filePath, { encoding: 'utf8' });
        var minifiedCode = null;

        if (path.extname(assetName) === '.js') {
            // variable name mangling
            var willMangle = true;
            var uglifyjsOpts = buildOpts.uglifyjs || {};
            var isCliArgvCloseMangle = typeof opt.min === 'string' && opt.min.split('=')[0] === 'mangle' && opt.min.split('=')[1] === 'false';
            var isBuildOptsCloseMangle = uglifyjsOpts.mangle === false;
            if (isCliArgvCloseMangle || isBuildOptsCloseMangle) {
                willMangle = false;
            }

            try {
                var ast = jsParser.parse(content);
                ast = willMangle ? jsUglify.ast_mangle(ast, uglifyjsOpts.mangle) : ast;
                ast = uglifyjsOpts.squeeze ? jsUglify.ast_squeeze(ast, uglifyjsOpts.squeeze) : ast;
                minifiedCode = jsUglify.gen_code(ast, uglifyjsOpts.genCode);
            } catch (e) {
                var type = (0, _typeof3.default)(e.line);

                if (e.line) {
                    var lineRange = 5;
                    var errorSource = '';
                    for (var lineIndex = e.line - lineRange, lineMax = e.line + lineRange; lineIndex < lineMax; lineIndex++) {
                        get_line(filePath, lineIndex, function (err, line) {
                            if (line != null) errorSource += line.trim() + '\n';
                        });
                    }

                    errorSource = beautify(errorSource, { indent_size: 4 });
                    errorSource = errorSource.split('\n').map(function (codeLine, index) {
                        return codeLine = ('line: ' + (e.line + index) + '    ').grey + codeLine.red + '\n';
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
            var uglifycssOpts = buildOpts.uglifycss || {};
            minifiedCode = cssUglify.processString(content, uglifycssOpts);
        }

        if (minifiedCode) {
            fs.writeFileSync(path.resolve(cwd, assetName), minifiedCode, { encoding: 'utf8' });

            // 重新生成版本号， webpack 打的样式文件 hash 会根据所在目录不同而不同，造成 beta/prd 环境下版本号不一致
            if (assetName.indexOf(HASH_PLACEHOLDER) > -1) {
                var version = md5(minifiedCode).slice(0, 20); // 和 webpack hash 长度保持一致
                var nextName = assetName.replace(HASH_PLACEHOLDER, version);
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
    if (+line_no > lines.length) {
        throw new Error('File end reached without finding line');
    }

    callback(null, lines[+line_no]);
}

function md5(content) {
    return crypto.createHash('md5').update(content).digest('hex');
}