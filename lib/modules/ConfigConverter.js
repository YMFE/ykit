'use strict';

var webpack = require('webpack');

module.exports = function (config) {

    config = handleLoaders(config);
    config = handleMigrationConfig(config);
    config = handleNotAllowedConfig(config);

    return config;
};

function handleLoaders(config) {
    var preLoaders = config.module.preLoaders.map(function (loader) {
        loader.enforce = 'pre';
        return loader;
    });

    var postLoaders = config.module.postLoaders.map(function (loader) {
        loader.enforce = 'post';
        return loader;
    });

    config.module.loaders = preLoaders.concat(config.module.loaders, postLoaders);

    config.module.loaders = config.module.loaders.map(function (loader) {
        if (loader.loader && loader.loaders) {
            logWarn('Provided loader and loaders for rule (use only one of them):');
            info(JSON.stringify(loader, null, 4).yellow + '\n');
            delete loader.loader;
        }
        return loader;
    });

    config.plugins.push(new webpack.LoaderOptionsPlugin({
        options: {
            fekitDomainMappingList: config.fekitDomainMappingList,
            sync: config.sync,
            envParams: config.envParams,
            projectCwd: config.projectCwd,
            resolve: config.resolve,

            // fix sassLoader webpack2 error: https://github.com/webpack-contrib/sass-loader/issues/285
            sassLoader: {
                includePaths: [sysPath.resolve(__dirname, 'src', 'scss')]
            },
            context: '/'
        }
    }));

    delete config.module.preLoaders;
    delete config.module.postLoaders;

    return config;
}

function handleMigrationConfig(config) {
    return config;
}

function handleNotAllowedConfig(config) {
    var removeConfigNames = ['cwd', 'sync', 'projectCwd', 'envParams', 'fekitDomainMappingList', 'requireRules', 'entryExtNames', 'getVendor'];
    removeConfigNames.map(function (configName) {
        delete config[configName];
    });

    return config;
}