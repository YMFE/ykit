'use strict';

module.exports = {
    apply: (compiler) => {
        const entryExtNames = compiler.options.entryExtNames

        compiler.plugin("compilation", function(compilation) {
            compilation.mainTemplate.plugin("asset-path", function(path, data) {
                let extName = '[ext]';
                if (data.chunk) {
                    let rawRequest = data.chunk.origins[0].module.rawRequest;
                    extName = sysPath.extname(rawRequest);

                    if (entryExtNames.css.indexOf(sysPath.extname(sysPath.basename(rawRequest, '.js'))) > -1) {
                        extName = '.cache';
                    }

                    // 应用后缀转换规则
                    Object.keys(entryExtNames).map((targetExtName) => {
                        if(entryExtNames[targetExtName].indexOf(extName) > -1){
                            extName = '.' + targetExtName
                        }
                    })
                }
                return path.replace(/\[ext\]/g, extName);
            });
        });
    }
};
