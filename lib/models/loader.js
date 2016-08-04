'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (content) {
    var self = this;

    // * * * 根据 fekit 规则进行依赖转换 * * *

    /**
    *   当 require module 的路径在当前目录下有匹配的资源，则加上 './' ，防止 webpack 将其当做 module 处理
    *   存在index.js: require('index.js') => require('./index.js')
    *   存在aaa/index.js: require('aaa/index.js') => require('./aaa/index.js')
    *   不存在jquery/index.js: require('jquery/index.js') => require('jquery/index.js')
    **/
    content = content.replace(/require\([\'|\"]([^.|\'|\"]+)\.(\w+)[\'|\"]\)/igm, function (match, filepath, postfix) {
        if (fileExists(path.resolve(self.context, filepath + "." + postfix))) {
            return "require('.\/" + filepath + "." + postfix + "')";
        } else {
            return match;
        }
    });

    /**
    *   存在aaa.js: require('aaa') => require('./aaa')
    *   不存在bbb.js: require('bbb') => require('bbb')
    **/
    content = content.replace(/require\([\'|\"]([^.|\'|\"]+)[\'|\"]\)/igm, function (match, filepath) {
        // var files = Finder.in(self.context).findFiles(filepath + '.js');
        if (fileExists(path.resolve(self.context, filepath + ".js"))) {
            return "require('.\/" + filepath + "')";
        }
        return match;
    });

    return content;
};

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}