'use strict';

const Manager = require('../modules/GlobalManager');

module.exports = {
    apply: (compiler) => {
        const entryExtNames = Manager.getYkitConf('entryExtNames');

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

                    if (entryExtNames.css.indexOf(sysPath.extname(sysPath.basename(rawRequest, '.js'))) > -1) {
                        extName = '.cache';
                    }

                    // 应用后缀转换规则
                    Object.keys(entryExtNames).map((targetExtName) => {
                        if(entryExtNames[targetExtName].indexOf(extName) > -1){
                            extName = '.' + targetExtName;
                        }
                    });


                    // 替换[name]为文件名，如index.js：[name][ext] => index[ext]
                    let firstChunk;
                    module.forEachChunk((chunk, index) => {
                        if(index === 0) {
                            firstChunk = chunk;
                        }
                    });
                    if(firstChunk && firstChunk.name && typeof assetPath.replace === 'function') {
                        // 通过 module.blocks 为空数组过滤掉异步加载的 chunk，它们的 [name] 不需要替换
                        if(module.blocks.length === 0) {
                            assetPath = assetPath.replace(/\[name\]/g, firstChunk.name.replace(/\.\w+$/g, ''));
                        }
                    }
                }

                return assetPath.replace(/\[ext\]/g, extName);
            });
        });
    }
};
