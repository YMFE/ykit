var fs = require('fs');
var path = require('path');

var USER_HOME = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
var YKIT_RC = path.join(USER_HOME, '.ykitrc');

if(!fileExists(YKIT_RC)) {
    var initRc = {
        "commands": [],
        "configs": []
    }
    fs.writeFileSync(YKIT_RC, JSON.stringify(initRc, null, '    '));
}

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}
