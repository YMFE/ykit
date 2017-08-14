'use strict';

const path = require('path');
const webpack = require('webpack');

const UtilFs = require('../utils/fs');
const UtilPath = require('../utils/path');

let usingHotServer = null;

module.exports = {
    removeCacheDir: function(middlewareCache, projectName, projectDir) {
        let isFirstCompileDir = true;
        Object.keys(middlewareCache).map((cacheName) => {
            if (cacheName.startsWith(projectName)) {
                isFirstCompileDir = false;
            }
        });
        if (isFirstCompileDir) {
            UtilFs.deleteFolderRecursive(sysPath.join(projectDir, YKIT_CACHE_DIR), true);
        }
    },
    setHotServer: function(wpConfig, projectDir, projectName, port) {
        // 修改 publicPath 为当前服务
        let localPublicPath = wpConfig.output.local.publicPath;
        const hostReg = /(http:|https:)?(\/\/)([^\/]+)/i;

        if(localPublicPath && localPublicPath.match(hostReg).length === 4) {
            localPublicPath = '/' + UtilPath.normalize(localPublicPath, false);
            localPublicPath = localPublicPath.replace(hostReg, (matches, httpStr, splitStr, host) => {
                httpStr = httpStr || '';
                return httpStr + '//' + '127.0.0.1:' + port;
            });
            wpConfig.output.local.publicPath = localPublicPath;
        } else {
            // hot 且 未指定 publicPath 需要手动设置方式 hot.json 404
            const relativePath = sysPath.relative(projectDir, wpConfig.output.local.path);
            wpConfig.output.local.publicPath = `http://127.0.0.1:${port}/${projectName}/${relativePath}/`;
        }

        wpConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

        if(!usingHotServer) {
            usingHotServer = projectName;
            if(typeof wpConfig.entry === 'object') {
                Object.keys(wpConfig.entry).map((key) => {
                    let entryItem = wpConfig.entry[key];
                    if(sysPath.extname(entryItem[entryItem.length - 1]) === '.js') {
                        const whmPath = require.resolve('webpack-hot-middleware/client');
                        const hotPath = `http://127.0.0.1:${port}/__webpack_hmr`;
                        entryItem.unshift(whmPath + '?reload=true&path=' + hotPath + '&timeout=9999999&overlay=false');
                    }
                    return entryItem;
                });
            }
        }
    }
};
