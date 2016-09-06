"use strict";

var fs = require('fs');
module.exports = {
    deleteFolderRecursive: function deleteFolderRecursive(path, remainRootDir) {
        var self = this;
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) {
                    // recurse
                    self.deleteFolderRecursive(curPath);
                } else {
                    // delete file
                    fs.unlinkSync(curPath);
                }
            });

            if (!remainRootDir) {
                fs.rmdirSync(path);
            }
        }
    }
};