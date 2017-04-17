'use strict';

const webpack = require('webpack');
const extend = require('extend');

module.exports = function(config) {

    config = handleLoaders(config);
    config = handleMigrationConfig(config);
    config = handleNotAllowedConfig(config);

    return config;
};

function handleLoaders(config) {
    const preLoaders = config.module.preLoaders.map((loader) => {
        loader.enforce = 'pre';
        return loader;
    });

    const postLoaders = config.module.postLoaders.map((loader) => {
        loader.enforce = 'post';
        return loader;
    });

    config.module.loaders = preLoaders.concat(config.module.loaders, postLoaders);

    config.module.loaders = config.module.loaders.map((loader) => {
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
    if (config.resolve && config.resolve.root) {
        extend(true, config.resolve.modules || [], config.resolve.root);
        delete config.resolve.root;
    }

    if (config.module && config.module.loaders) {
        extend(true, config.module.rules || [], config.module.loaders);
        delete config.module.loaders;

        config.module.rules = config.module.rules.map((rule) => {
            if (rule.loaders) {
                rule.use = rule.loaders;
                delete rule.loaders;
            } else if (rule.loader) {
                if (Array.isArray(rule.loader)) {
                    rule.use = loaderSuffixWrapper(rule.loader);
                } else {
                    rule.use = rule.loader.split('!');
                }
                delete rule.loader;
            }

            return rule;
        });
    }

    function loaderSuffixWrapper(loader) {
        const simpleLoaderReg = /\w+/;

        if(Array.isArray(loader)) {
            loader.map((loaderItem) => {
                if(simpleLoaderReg.test(loaderItem)) {
                    // console.log('loaderItem', loaderItem);
                }
            });
        }

        return loader;
    }

    return config;
}

function handleNotAllowedConfig(config) {
    const removeConfigNames = [
        'cwd',
        'sync',
        'projectCwd',
        'envParams',
        'fekitDomainMappingList',
        'requireRules',
        'entryExtNames',
        'getVendor'
    ];
    removeConfigNames.map((configName) => {
        delete config[configName];
    });

    return config;
}
