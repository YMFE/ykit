'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Manager = require('./manager.js');
var UtilFs = require('../utils/fs.js');

modules.exports = function (req, res, next) {
    var projectInfo = getProjectInfo(req);
    var project = Manager.getProject(projectInfo.projectCwd, { cache: false });
    var cwd = projectInfo.projectCwd;
    var shouldMock = mock || project.server && project.server.mock;

    if (!shouldMock) {
        next();
    }

    if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
        if (!mockCache[projectInfo.projectName]) {
            mockCache[projectInfo.projectName] = true;

            // get mock file
            var mockFile = '';
            if (typeof mock === 'string') {
                if (UtilFs.fileExists(mock)) {
                    mockFile = mock;
                } else {
                    logError('Mock file ' + mock.bold + ' not found in ' + cwd.bold);
                }
            } else {
                var localConfigFiles = getMockFiles(['mock.js', 'mock.json']);
                if (localConfigFiles.length > 0) {
                    mockFile = localConfigFiles[0];
                }
            }

            // get mock rules
            if (mockFile) {
                var ext = sysPath.extname(mockFile);
                if (ext === '.js') {
                    var appMockRules = require(sysPath.join(cwd, mockFile));
                    var formattedRules = [];
                    if ((typeof appMockRules === 'undefined' ? 'undefined' : (0, _typeof3.default)(appMockRules)) === 'object') {
                        log(('Start using ' + mockFile + ' for simulation.').cyan);
                        (0, _keys2.default)(appMockRules).map(function (itemKey) {
                            if (itemKey === 'rules') {
                                formattedRules = formattedRules.concat(appMockRules[itemKey]);
                            } else {
                                formattedRules.push({
                                    pattern: itemKey,
                                    respondwith: appMockRules[itemKey]
                                });
                            }
                        });
                        mockRules[projectInfo.projectName] = formattedRules.map(function (r) {
                            return extend(r, { cwd: cwd });
                        });
                    } else {
                        logError('Invalid mock rules, please check your mock config.');
                    }
                }
            }
        }

        next();
    } else {
        var mockResult = void 0;
        var mockAction = function mockAction(rule, req, res) {
            var rw = rule.respondwith;
            var cwd = rule.cwd; // different from current req cwd

            var resObj = {};

            // TODO handle object

            // handle file
            var mockPath = sysPath.join(cwd, rw);
            if (UtilFs.fileExists(mockPath)) {
                if (sysPath.extname(rw) === '.js' || sysPath.extname(rw) === '.json') {
                    resObj = Mock.mock(require(mockPath));
                } else if (sysPath.extname(rw)) {
                    try {
                        resObj = Mock.mock(JSON.parse(fs.readFileSync(mockPath, 'utf-8')));
                    } catch (e) {
                        logError('Parse error in ' + mockPath.bold + ' \n' + e);
                    }
                }
            } else {
                logError('Not found ' + mockPath.bold);
            }

            req.mock = true;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end((0, _stringify2.default)(resObj));
        };

        (0, _keys2.default)(mockRules).map(function (mockApp) {
            mockRules[mockApp].map(function (rule) {
                var isReg = Object.prototype.toString.call(rule.pattern).indexOf('RegExp') > -1;
                var result = void 0;

                if (isReg) {
                    result = req.url.match(rule.pattern);
                } else {
                    result = req.url.indexOf(rule.pattern) === 0;
                }

                if (result) {
                    mockResult = mockAction(rule, req, res);
                }
            });
        });

        if (!mockResult) {
            next();
        }
    }

    function getMockFiles() {
        var names = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var searchPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

        console.log();
        return globby.sync(['mock.js', 'mock.json'], { cwd: sysPath.join(cwd, searchPath) });
    }
};

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