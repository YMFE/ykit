'use strict';

const fs = require('fs');
const path = require('path');

const Manager = require('../modules/manager.js');
const utilMw = require('../utils/middleware.js');
const utilFs = require('../utils/fs.js');

const tmplExtensions = ['.html', '.vm', '.string'];

module.exports = function(req, res, next) {
    const projectInfo = utilMw.getProjectInfo(req);
    const project = Manager.getProject(projectInfo.projectCwd, { cache: false });
    const extName = path.extname(req.url);

    if(tmplExtensions.indexOf(extName) > -1) {
        const htmlFilePath = path.join(
            projectInfo.projectCwd,
            req.url.replace(/.+\/src\//, 'src/')
        );

        const replacedContent = handleHtmlContent(htmlFilePath);

        if(!replacedContent) {
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
        if(!utilFs.fileExists(htmlFilePath)) {
            return '';
        }

        let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

        const staticHost = project.server && project.server.staticHost;
        if(staticHost) {
            Object.keys(staticHost).map((hostName) => {
                const hostReg = new RegExp(`(src|href)=("|')\/\/(${hostName})`, 'g');

                let matches;
                while((matches = hostReg.exec(htmlContent)) !== null) {
                    const host = matches[3];
                    htmlContent = htmlContent.replace(host, staticHost[hostName]);
                }
            });
        }

        return htmlContent;
    }
};
