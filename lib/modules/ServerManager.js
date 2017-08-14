'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var webpack = require('webpack');

var UtilFs = require('../utils/fs');
var UtilPath = require('../utils/path');

var usingHotServer = null;

module.exports = {
    removeCacheDir: function removeCacheDir(middlewareCache, projectName, projectDir) {
        var isFirstCompileDir = true;
        (0, _keys2.default)(middlewareCache).map(function (cacheName) {
            if (cacheName.startsWith(projectName)) {
                isFirstCompileDir = false;
            }
        });
        if (isFirstCompileDir) {
            UtilFs.deleteFolderRecursive(sysPath.join(projectDir, YKIT_CACHE_DIR), true);
        }
    },
    setHotServer: function setHotServer(wpConfig, projectDir, projectName, port) {
        // 修改 publicPath 为当前服务
        var localPublicPath = wpConfig.output.local.publicPath;
        var hostReg = /(http:|https:)?(\/\/)([^\/]+)/i;

        if (localPublicPath && localPublicPath.match(hostReg).length === 4) {
            localPublicPath = '/' + UtilPath.normalize(localPublicPath, false);
            localPublicPath = localPublicPath.replace(hostReg, function (matches, httpStr, splitStr, host) {
                httpStr = httpStr || '';
                return httpStr + '//' + '127.0.0.1:' + port;
            });
            wpConfig.output.local.publicPath = localPublicPath;
        } else {
            // hot 且 未指定 publicPath 需要手动设置方式 hot.json 404
            var relativePath = sysPath.relative(projectDir, wpConfig.output.local.path);
            wpConfig.output.local.publicPath = 'http://127.0.0.1:' + port + '/' + projectName + '/' + relativePath + '/';
        }

        wpConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

        if (!usingHotServer) {
            usingHotServer = projectName;
            if ((0, _typeof3.default)(wpConfig.entry) === 'object') {
                (0, _keys2.default)(wpConfig.entry).map(function (key) {
                    var entryItem = wpConfig.entry[key];
                    if (sysPath.extname(entryItem[entryItem.length - 1]) === '.js') {
                        var whmPath = require.resolve('webpack-hot-middleware/client');
                        var hotPath = 'http://127.0.0.1:' + port + '/__webpack_hmr';
                        entryItem.unshift(whmPath + '?reload=true&path=' + hotPath + '&timeout=9999999&overlay=false');
                    }
                    return entryItem;
                });
            }
        }
    }
};