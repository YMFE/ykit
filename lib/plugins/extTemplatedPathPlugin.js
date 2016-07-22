'use strict';

module.exports = {
    apply: function apply(compiler) {
        var entryExtNames = compiler.options.entryExtNames;

        compiler.plugin("compilation", function (compilation) {
            compilation.mainTemplate.plugin("asset-path", function (path, data) {
                var extName = '[ext]';
                if (data.chunk) {
                    var _module = data.chunk.origins[0].module,
                        rawRequest = _module.rawRequest ? _module.rawRequest : _module.dependencies[_module.dependencies.length - 1].userRequest;

                    extName = sysPath.extname(rawRequest);

                    if (entryExtNames.css.indexOf(sysPath.extname(sysPath.basename(rawRequest, '.js'))) > -1) {
                        extName = '.cache';
                    }

                    // 应用后缀转换规则
                    Object.keys(entryExtNames).map(function (targetExtName) {
                        if (entryExtNames[targetExtName].indexOf(extName) > -1) {
                            extName = '.' + targetExtName;
                        }
                    });
                }

                return path.replace(/\[ext\]/g, extName);
            });
        });
    }
};