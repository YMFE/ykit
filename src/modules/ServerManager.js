'use strict';

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const ConfigProcessCircle = require('./ConfigProcessCircle');
const UtilFs = require('../utils/fs');
const UtilPath = require('../utils/path');

let usingHotServer = null;

module.exports = {
    removeCacheDir(middlewareCache, projectName, projectDir) {
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
    setHotServer(webpackConfig, projectDir, projectName, port) {
        // 修改 publicPath 为当前服务
        let localPublicPath = webpackConfig.output.local.publicPath;
        const hostReg = /(http:|https:)?(\/\/)([^/]+)/i;

        if(localPublicPath && localPublicPath.match(hostReg).length === 4) {
            localPublicPath = '/' + UtilPath.normalize(localPublicPath, false);
            localPublicPath = localPublicPath.replace(hostReg, (matches, httpStr, splitStr, host) => {
                httpStr = httpStr || '';
                return httpStr + '//' + '127.0.0.1:' + port;
            });
            webpackConfig.output.local.publicPath = localPublicPath;
        } else {
            // hot 且 未指定 publicPath 需要手动设置方式 hot.json 404
            const relativePath = sysPath.relative(projectDir, webpackConfig.output.local.path);
            webpackConfig.output.local.publicPath = `http://127.0.0.1:${port}/${projectName}/${relativePath}/`;
        }

        webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

        if(!usingHotServer) {
            usingHotServer = projectName;
            if(typeof webpackConfig.entry === 'object') {
                Object.keys(webpackConfig.entry).map((key) => {
                    let entryItem = webpackConfig.entry[key];
                    if(sysPath.extname(entryItem[entryItem.length - 1]) === '.js') {
                        const whmPath = require.resolve('webpack-hot-middleware/client');
                        const hotPath = `http://127.0.0.1:${port}/__webpack_hmr`;
                        entryItem.unshift(whmPath + '?reload=true&path=' + hotPath + '&timeout=9999999&overlay=false');
                    }
                    return entryItem;
                });
            }
        }
    },
    async getCompiler (shouldCompileAllEntries, reqUrl, callback) {

        let webpackConfig = extend(true, {}, this.config._config);
        const entries = extend(true, {}, webpackConfig.entry);

        webpackConfig.output = extend(
            true,
            {
                path: webpackConfig.output.prd.path,
                filename: '[name][ext]'
            },
            webpackConfig.output.local || {}
        );

        if(!shouldCompileAllEntries) {
            // entry 应该是个空对象, 这样如果没有找到请求对应的 entry, 就不会编译全部入口
            webpackConfig.entry = {};

            // 将 webpack entry 设置为当前请求的资源
            Object.keys(entries).map((entryKey) => {
                const entryItem = entries[entryKey];

                let entryPath = '';

                if (Array.isArray(entryItem)) {
                    entryPath = entryItem[entryItem.length - 1];
                } else {
                    entryPath = entryItem;
                }

                // 应用后缀转换规则
                const entryExtNames = webpackConfig.entryExtNames;
                Object.keys(entryExtNames).map((targetExtName) => {
                    let exts = entryExtNames[targetExtName];

                    // 如果是 css 要考虑 css.js 的情况
                    if(targetExtName === 'css') {
                        exts = exts.concat(
                            entryExtNames[targetExtName].map((name) => {
                                return name + '.js';
                            })
                        );
                    }

                    exts = exts.map((name) => {
                        return name + '$';
                    });
                    const replaceReg = new RegExp('\\' + exts.join('|\\'));
                    entryPath = UtilPath.normalize(
                        entryPath.replace(replaceReg, '.' + targetExtName)
                    );
                });

                // 如果是 ykit 处理过的样式文件，将其变为正常的请求路径(../.ykit_cache/main/index.css => main/index.css)
                if (entryPath.indexOf('.css.js') && entryPath.indexOf('.ykit_cache/') > 1) {
                    entryPath = entryPath.split('.ykit_cache/')[1];
                }

                // 判断所请求的资源是否在入口配置中
                const matchingPath = sysPath.normalize(entryPath) === sysPath.normalize(reqUrl);
                const matchingKey = sysPath.normalize(reqUrl) === entryKey + sysPath.extname(reqUrl);

                if (matchingPath || matchingKey) {
                    webpackConfig.entry = {
                        [entryKey]: entryItem
                    };
                }
            });
        }

        // TODO fixcss?

        // 添加 server 所需 plugins
        webpackConfig.plugins.push(require('../plugins/progressBarPlugin.js'));
        webpackConfig.plugins.push(require('../plugins/compileInfoPlugin.js'));
        const isExtractTextPluginExists = webpackConfig.plugins.some((plugin) => {
            return plugin instanceof ExtractTextPlugin;
        });
        if(!isExtractTextPluginExists) {
            webpackConfig.plugins.push(new ExtractTextPlugin(webpackConfig.output.filename.replace('[ext]', '.css')));
        }

        // 执行 beforeCompiling
        webpackConfig = await ConfigProcessCircle.runTasksBeforeCompiling(this.hooks, webpackConfig);

        // 返回 compiler
        const entryNum = Object.keys(webpackConfig.entry).length;
        callback(entryNum > 0 ? webpack(webpackConfig) : null);
    }
};
