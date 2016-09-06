const fs = require('fs');
module.exports = {
    deleteFolderRecursive: function(path, remainRootDir) {
        const self = this
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function(file, index) {
                const curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    self.deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });

            if(!remainRootDir) {
                fs.rmdirSync(path);
            }
        }
    }
}
