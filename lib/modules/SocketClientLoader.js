'use strict';

var UglifyJS = require('uglify-js');

module.exports = function (content) {
    var embedScript = '';

    if (!this._compiler.overLayPath || this._compiler.overLayPath === this.resourcePath) {
        this._compiler.overLayPath = this.resourcePath;

        // 去除形如 index.scss.js 的文件
        var basename = sysPath.basename(this.resourcePath, '.js');
        var isNotPkg = this.resourcePath.indexOf('node_modules') === -1;

        if (sysPath.extname(this.resourcePath) === '.js' && sysPath.extname(basename).length === 0 && isNotPkg) {
            var socketScript = fs.readFileSync(sysPath.join(__dirname, '../../static/SocketEmbedment.js'), { encoding: 'utf-8' });
            var overlayScript = fs.readFileSync(sysPath.join(__dirname, '../../static/SocketOverlay.js'), { encoding: 'utf-8' });
            overlayScript = UglifyJS.minify(overlayScript, {
                fromString: true,
                mangle: true
            }).code;

            var cacheId = this.query.replace('?cacheId=', '');
            embedScript = socketScript.replace('@OVERLAY_SCRIPT', overlayScript).replace('@COMPILING_ASSET', cacheId);
        }
    }

    return embedScript + content;
};