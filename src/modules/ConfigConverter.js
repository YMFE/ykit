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

            // 去掉空 loader
            if(Array.isArray(rule.use)) {
                rule.use = rule.use.filter((useItem) => {
                    if(typeof useItem.loader !== 'undefined' && !useItem.loader) {
                        return false ;
                    }

                    return true;
                });
            }

            // for babel-loader
            if(rule.query) {
                rule.use = rule.use.map((item, i) => {
                    if(typeof item === 'string' && item.indexOf('babel-loader') > -1) {
                        return {
                            loader: item,
                            options: rule.query
                        };
                    }
                    return item;
                });
                delete rule.query;
            }

            return rule;
        });
    }

    function loaderSuffixWrapper(loader) {
        const simpleLoaderReg = /^\w+$/;

        if(Array.isArray(loader)) {
            loader.map((loaderItem) => {
                if(simpleLoaderReg.test(loaderItem.loader)) {
                    loaderItem.loader += '-loader';
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
        'getVendor',
        'middleware',
        'postcss' // FIXME 这里要考虑兼容情况
    ];
    removeConfigNames.map((configName) => {
        delete config[configName];
    });

    return config;
}
