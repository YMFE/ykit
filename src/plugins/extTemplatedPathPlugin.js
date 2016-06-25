'use strict';

module.exports = {
    apply: (compiler) => {
        compiler.plugin("compilation", function(compilation) {
            compilation.mainTemplate.plugin("asset-path", function(path, data) {
                let extName = '[ext]';
                if (data.chunk) {
                    let rawRequest = data.chunk.origins[0].module.rawRequest;
                    extName = sysPath.extname(rawRequest);
                    if (sysPath.extname(sysPath.basename(rawRequest, '.js')) == '.css') {
                        extName = '.cache';
                    }
                }
                return path.replace(/\[ext\]/g, extName);
            });
        });
    }
};
