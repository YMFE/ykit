'use strict';

module.exports = {
    apply: (compiler) => {
        const entryExtNames = compiler.options.entryExtNames

        compiler.plugin("compilation", function(compilation) {
            compilation.mainTemplate.plugin("asset-path", function(path, data) {
                let extName = '[ext]';
                let baseName = '';
                if (data.chunk) {
                    let module = data.chunk.origins[0].module,
                        rawRequest = module.rawRequest
                                        ? module.rawRequest
                                        : module.dependencies[module.dependencies.length - 1].userRequest;

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

                    // 替换[name]为文件名，如index.js：[name][ext] => index[ext]
                    if(module.chunks[0] && module.chunks[0].name) {
                        path = path.replace(/\[name\]/g, module.chunks[0].name.replace(/\.\w+$/g, ''));
                    }
                }

                return path.replace(/\[ext\]/g, extName);
            });
        });
    }
};
