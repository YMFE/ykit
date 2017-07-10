'use strict';

let fs = require('fs');
let path = require('path');
let yaml = require('js-yaml');

exports.readJSON = function(loc){
    try {
        return JSON.parse(fs.readFileSync(loc, 'utf8'));
    } catch (err) {
        err.message = `${loc}: ${err.message}`;
        throw err;
    }
};

exports.readYAML = function(loc) {
    try {
        return yaml.safeLoad(fs.readFileSync(loc, 'utf-8')) || {};
    } catch (err) {
        err.message = `${loc}: ${err.message}`;
        throw err;
    }
};

exports.readJS = function(loc){
    try {
        delete require.cache[loc];
        return require(loc);
    } catch (err) {
        err.message = `${loc}: ${err.message}`;
        throw err;
    }
};

exports.fileExists = function(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
};

exports.dirExists = function(dirPath) {
    try {
        return fs.statSync(dirPath).isDirectory();
    } catch (err) {
        return false;
    }
};

/**
 * @function readFile
 * @param {string} loc 需要读取的文件的完整路径
 * @return {object}
 * @description 该方法接受一个文件路径作为参数，把文件内容解析为 JavaScript 对象后返回
 * 如果文件不存在，返回空对象。
 */
exports.readFile = function(loc){
    let content = null;
    switch (path.extname(loc)) {
    case '.js':
        content = exports.readJS(loc);
        break;
    case '.json':
        content = exports.readJSON(loc);
        break;
    case '.yml':
    case '.yaml':
        content = exports.readYAML(loc);
        break;
    default:
        break;
    }
    return content;
};

/**
 * @function readFileAny
 * @param {array} files 尝试读取的文件列表
 * @return {object}
 * @description 尝试对一组文件进行读取，找到第一个存在的文件，并返回解析得到的
 * JavaScript 对象，如果所有文件都不存在，返回空对象。
 *
 */
exports.readFileAny = function(files){
    for(const file of files){
        if(fs.existsSync(file)){
            return exports.readFile(file);
        }
    }
    return null;
};


/**
 * @function deleteFolderRecursive
 * @param {array} files 尝试读取的文件列表
 * @return {object}
 * @description 尝试对一组文件进行读取，找到第一个存在的文件，并返回解析得到的
 * JavaScript 对象，如果所有文件都不存在，返回空对象。
 *
 */
exports.deleteFolderRecursive = function(filePath, remainRootDir) {
    if (fs.existsSync(filePath)) {
        fs.readdirSync(filePath).forEach((file) => {
            const currentPath = filePath + '/' + file;
            if (fs.lstatSync(currentPath).isDirectory()) { // recurse
                exports.deleteFolderRecursive(currentPath);
            } else { // delete file
                fs.unlinkSync(currentPath);
            }
        });

        if(!remainRootDir) {
            fs.rmdirSync(filePath);
        }
    }
};

exports.getFileSize = function(filename) {
    try {
        const stats = fs.statSync(filename);

        return stats['size'] > 1024
                ? (stats['size'] / 1024).toFixed(2) + ' KB'
                : stats['size'] + ' Bytes';
    } catch (err) {
        return null;
    }
};
