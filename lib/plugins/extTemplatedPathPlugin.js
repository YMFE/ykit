'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Manager = require('../modules/manager');

module.exports = {
    apply: function apply(compiler) {
        var entryExtNames = Manager.getYkitConf('entryExtNames');

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
                            (0, _keys2.default)(entryExtNames).map(function (targetExtName) {
                                if (entryExtNames[targetExtName].indexOf(extName) > -1) {
                                    extName = '.' + targetExtName;
                                }
                            });
                        }

                        // 替换[name]为文件名，如index.js：[name][ext] => index[ext]
                        _module.forEachChunk(function (chunk) {
                            if (chunk.name) {
                                path = path.replace(/\[name\]/g, chunk.name.replace(/\.\w+$/g, ''));
                            }
                        });
                    }
                } catch (e) {
                    logError(e);
                }

                return path.replace(/\[ext\]/, extName);
            });
        });
    }
};