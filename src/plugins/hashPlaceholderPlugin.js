'use strict';

function HashPlaceholder () {

}

HashPlaceholder.prototype.apply = function(compiler) {
    compiler.plugin('compilation', function(compilation) {
        compilation.plugin('chunk-hash', function(chunk, chunkHash) {
            chunkHash.digest = function () {
                return '[hashPlaceholder]';
            };
        });
    });
};

module.exports = new HashPlaceholder();
