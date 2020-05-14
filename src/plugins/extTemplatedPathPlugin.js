'use strict';
const { ENTRY_EXTNAMES } = require('../models/constans');

module.exports = {
    apply: (compiler) => {
        //const ENTRY_EXTNAMES = compiler.options.ENTRY_EXTNAMES;

        compiler.plugin('compilation', function(compilation) {
            compilation.mainTemplate.plugin('asset-path', function(assetPath, data) {
                // handle ExtractTextPlugin options

                if(typeof assetPath === 'object' && assetPath.filename) {
                    assetPath = assetPath.filename;
                }

                let extName = '.js';
                if (data.chunk && data.chunk.origins && data.chunk.origins[0]) {
                    let module = data.chunk.origins[0].module,
                        rawRequest = module.rawRequest
                                        ? module.rawRequest
                                        : module.dependencies[module.dependencies.length - 1].userRequest;

                    extName = sysPath.extname(rawRequest);
                    if (ENTRY_EXTNAMES.css.indexOf(sysPath.extname(sysPath.basename(rawRequest, '.js'))) > -1) {
                        extName = '.cache';
                    }

                    // 应用后缀转换规则
                    Object.keys(ENTRY_EXTNAMES).map((targetExtName) => {
                        if(ENTRY_EXTNAMES[targetExtName].indexOf(extName) > -1){
                            extName = '.' + targetExtName;
                        }
                    });

                    // 替换[name]为文件名，如index.js：[name][ext] => index[ext]
                    if(module.chunks[0] && module.chunks[0].name && typeof assetPath.replace === 'function') {
                        // 通过 module.blocks 为空数组过滤掉异步加载的 chunk，它们的 [name] 不需要替换
                        if(module.blocks.length === 0) {
                            assetPath = assetPath.replace(/\[name\]/g, module.chunks[0].name.replace(/\.\w+$/g, ''));
                        }
                    }
                }



                return assetPath.replace(/\[ext\]/g, extName);
            });
        });
    }
};
