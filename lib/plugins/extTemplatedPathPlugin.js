'use strict';

var Manager = require('../modules/manager');

module.exports = {
    apply: function apply(compiler) {
        var entryExtNames = Manager.getYkitOptions(compiler.options, 'entryExtNames');

        compiler.plugin('compilation', function (compilation) {
            compilation.mainTemplate.plugin('asset-path', function (path, data) {
                var extName = '.js';
                try {
                    if (data.chunk && data.chunk.origins && data.chunk.origins[0]) {
                        var _module = data.chunk.origins[0].module,
                            rawRequest = _module.rawRequest ? _module.rawRequest : _module.dependencies[_module.dependencies.length - 1].userRequest;

                        extName = sysPath.extname(rawRequest);

                        if (entryExtNames && entryExtNames.css.indexOf(sysPath.extname(sysPath.basename(rawRequest, '.js'))) > -1) {
                            extName = '.cache';
                        }

                        if (entryExtNames) {
                            // 应用后缀转换规则
                            Object.keys(entryExtNames).map(function (targetExtName) {
                                if (entryExtNames[targetExtName].indexOf(extName) > -1) {
                                    extName = '.' + targetExtName;
                                }
                            });
                        }

                        // 替换[name]为文件名，如index.js：[name][ext] => index[ext]
                        if (_module.chunks[0] && _module.chunks[0].name) {
                            path = path.replace(/\[name\]/g, _module.chunks[0].name.replace(/\.\w+$/g, ''));
                        }
                    }
                } catch (e) {
                    logError(e);
                }

                return path.replace(/\[ext\]/g, extName);
            });
        });
    }
};