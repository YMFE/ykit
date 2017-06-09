'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var path = require('path');

var Manager = require('../modules/manager.js');
var utilMw = require('../utils/middleware.js');
var utilFs = require('../utils/fs.js');

var tmplExtensions = ['.html', '.vm', '.string'];

module.exports = function (req, res, next) {
    var projectInfo = utilMw.getProjectInfo(req);
    var project = Manager.getProject(projectInfo.projectCwd, { cache: false });
    var extName = path.extname(req.url);

    if (tmplExtensions.indexOf(extName) > -1) {
        var htmlFilePath = path.join(projectInfo.projectCwd, req.url.replace(/.+\/src\//, 'src/'));

        var replacedContent = handleHtmlContent(htmlFilePath);

        if (!replacedContent) {
            next();
        } else {
            res.setHeader('Content-Type', 'text/html; charset=UTF-8');
            res.writeHead(200);
            res.end(replacedContent);
        }
    } else {
        next();
    }

    function handleHtmlContent(htmlFilePath) {
        if (!utilFs.fileExists(htmlFilePath)) {
            return '';
        }

        var htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

        var staticHost = project.server && project.server.staticHost;
        if (staticHost) {
            (0, _keys2.default)(staticHost).map(function (hostName) {
                var hostReg = new RegExp('(src|href)=("|\')//(' + hostName + ')', 'g');

                var matches = void 0;
                while ((matches = hostReg.exec(htmlContent)) !== null) {
                    var host = matches[3];
                    htmlContent = htmlContent.replace(host, staticHost[hostName]);
                }
            });
        }

        return htmlContent;
    }
};