const Manager = require('./manager.js');
const UtilFs = require('../utils/fs.js');

modules.exports = function (req, res, next) {
    const projectInfo = getProjectInfo(req);
    const project = Manager.getProject(projectInfo.projectCwd, { cache: false });
    const cwd = projectInfo.projectCwd;
    const shouldMock = mock || (project.server && project.server.mock)

    if(!shouldMock) {
        next();
    }

    if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
        if(!mockCache[projectInfo.projectName]) {
            mockCache[projectInfo.projectName] = true;

            // get mock file
            let mockFile = '';
            if(typeof mock === 'string') {
                if(UtilFs.fileExists(mock)) {
                    mockFile = mock;
                } else {
                    logError(`Mock file ${mock.bold} not found in ${cwd.bold}`);
                }
            } else {
                const localConfigFiles = getMockFiles(['mock.js', 'mock.json']);
                if(localConfigFiles.length > 0) {
                    mockFile = localConfigFiles[0];
                }
            }

            // get mock rules
            if(mockFile) {
                const ext = sysPath.extname(mockFile);
                if(ext === '.js') {
                    let appMockRules = require(sysPath.join(cwd, mockFile));
                    let formattedRules = [];
                    if(typeof appMockRules === 'object') {
                        log(`Start using ${mockFile} for simulation.`.cyan)
                        Object.keys(appMockRules).map((itemKey) => {
                            if(itemKey === 'rules') {
                                formattedRules = formattedRules.concat(appMockRules[itemKey])
                            } else {
                                formattedRules.push({
                                    pattern: itemKey,
                                    respondwith: appMockRules[itemKey]
                                })
                            }
                        });
                        mockRules[projectInfo.projectName] = formattedRules.map(r => extend(r, {cwd}));
                    } else {
                        logError(`Invalid mock rules, please check your mock config.`);
                    }
                }
            }
        }

        next();
    } else {
        let mockResult;
        const mockAction = function (rule, req, res) {
            const rw = rule.respondwith;
            const cwd = rule.cwd; // different from current req cwd

            let resObj = {}

            // TODO handle object

            // handle file
            const mockPath = sysPath.join(cwd, rw);
            if(UtilFs.fileExists(mockPath)) {
                if(sysPath.extname(rw) === '.js' || sysPath.extname(rw) === '.json') {
                    resObj = Mock.mock(require(mockPath));
                } else if(sysPath.extname(rw)) {
                    try {
                        resObj = Mock.mock(JSON.parse(fs.readFileSync(mockPath, 'utf-8')));
                    } catch(e) {
                        logError(`Parse error in ${mockPath.bold} \n${e}`)
                    }
                }
            } else {
                logError(`Not found ${mockPath.bold}`);
            }

            req.mock = true;
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(resObj));
        };

        Object.keys(mockRules).map((mockApp) => {
            mockRules[mockApp].map((rule) => {
                const isReg = Object.prototype.toString.call(rule.pattern).indexOf('RegExp') > -1
                let result;

                if (isReg) {
                    result = req.url.match(rule.pattern);
                } else {
                    result = req.url.indexOf(rule.pattern) === 0;
                }

                if (result) {
                    mockResult = mockAction(rule, req, res);
                }
            })
        });

        if(!mockResult) {
            next();
        }
    }

    function getMockFiles(names = [], searchPath = '') {
        console.log();
        return globby.sync(['mock.js', 'mock.json'], { cwd: sysPath.join(cwd, searchPath) });
    }
}

function getProjectInfo(req) {
    var url = req.url,
        keys = url.split('/'),
        projectName = keys[1],
        projectCwd = sysPath.join(cwd, projectName);

    return {
        projectName: projectName,
        projectCwd: projectCwd
    };
}
