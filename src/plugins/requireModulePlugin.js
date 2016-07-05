'use strict';

module.exports = {
    apply: (compiler) => {
        let cwd = compiler.options.cwd,
            requireRules = (compiler.options.requireRules || []).map((item) => {
                let options = item.split('|'),
                    moduleRoot = options[0],
                    config = options[1].split(':'),
                    defaultFile = options[2];
                return (basePath, moduleName, query, callback) => {
                    while (basePath.length >= cwd.length) {
                        let modulePath = sysPath.join(basePath, moduleRoot, moduleName);
                        if (fs.existsSync(modulePath)) {
                            let configPath = sysPath.join(modulePath, config[0]),
                                entry = defaultFile;
                            if (fs.existsSync(configPath)) {
                                try {
                                    entry = JSON5.parse(fs.readFileSync(configPath, 'UTF-8'))[config[1] || 'main'] || entry;
                                } catch(e) {}
                            }
                            callback(null, {
                                path: sysPath.join(modulePath, entry),
								query: query,
								resolved: true
                            });
                            return true;
                        } else {
                            basePath = sysPath.dirname(basePath);
                        }
                    }
                    return false;
                };
            });


        compiler.resolvers.normal.plugin("module", function(request, finalCallback) {
            if (!requireRules.some((fn) => fn(request.path, request.request, require.query, finalCallback))) {
                finalCallback();
            }
        });
    }
}
