'use strict';

var path = require('path');

module.exports = {
    getProjectInfo: function getProjectInfo(req) {
        var url = req.url,
            keys = url.split('/'),
            projectName = keys[1],
            projectCwd = path.join(process.cwd(), projectName);

        return {
            projectName: projectName,
            projectCwd: projectCwd
        };
    }
};