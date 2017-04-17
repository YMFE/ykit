'use strict';

var jsParser = require('uglify-js').parser;
var jsUglify = require('uglify-js').uglify;

module.exports = function (content) {
    var embedScript = '';

    if (!this._compiler.overLayPath || this._compiler.overLayPath === this.resourcePath) {
        this._compiler.overLayPath = this.resourcePath;

        // 去除形如 index.scss.js 的文件
        var basename = sysPath.basename(this.resourcePath, '.js');
        var isNotPkg = this.resourcePath.indexOf('css-base') === -1;

        if (sysPath.extname(this.resourcePath) === '.js' && sysPath.extname(basename).length === 0 && isNotPkg) {
            var socketScript = fs.readFileSync(sysPath.join(__dirname, '../../static/socket/Embedment.js'), { encoding: 'utf-8' });
            var overlayScript = fs.readFileSync(sysPath.join(__dirname, '../../static/socket/Overlay.js'), { encoding: 'utf-8' });

            var ast = jsParser.parse(overlayScript);
            ast = jsUglify.ast_mangle(ast);
            var minifiedCode = jsUglify.gen_code(ast);

            var cacheId = this.query.replace('?cacheId=', '');
            embedScript = socketScript.replace('@OVERLAY_SCRIPT', minifiedCode).replace('@COMPILING_ASSET', cacheId);
        }
    }

    return embedScript + content;
};