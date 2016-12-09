'use strict';

/*
 * 解决样式文件的版本号生成问题，先用 placeholder 占位
 * 待压缩资源过后再重新生成版本号，替换占位符
 */

const styleExtNames = ['.css', '.scss', '.sass', '.less'];

function HashPlaceholder () {

}

HashPlaceholder.prototype.apply = function(compiler) {
    compiler.plugin('compilation', function(compilation) {
        compilation.plugin('chunk-hash', function(chunk, chunkHash) {
            if(chunk.name && styleExtNames.indexOf(sysPath.extname(chunk.name)) > -1) {
                chunkHash.digest = function () {
                    return '[hashPlaceholder]';
                };
            }
        });
    });
};

module.exports = new HashPlaceholder();
