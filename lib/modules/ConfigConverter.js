'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var webpack = require('webpack');
var extend = require('extend');

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
            info((0, _stringify2.default)(loader, null, 4).yellow + '\n');
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

        config.module.rules = config.module.rules.map(function (rule) {
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

            // 添加 -loader 后缀
            rule.use = rule.use.map(function (item) {
                var needAddingSuffix = function needAddingSuffix(str) {
                    return str.indexOf(sysPath.sep) > -1 || str.indexOf('-loader') > -1;
                };

                if ((typeof item === 'undefined' ? 'undefined' : (0, _typeof3.default)(item)) === 'object' && item.loader && !needAddingSuffix(item.loader)) {
                    item.loader = item.loader + '-loader';
                } else if (typeof item === 'string' && !needAddingSuffix(item)) {
                    item = item + '-loader';
                }

                return item;
            });

            // 去掉空 loader
            if (Array.isArray(rule.use)) {
                rule.use = rule.use.filter(function (useItem) {
                    if (typeof useItem.loader !== 'undefined' && !useItem.loader) {
                        return false;
                    }

                    return true;
                });
            }

            // for babel-loader
            if (rule.query) {
                rule.use = rule.use.map(function (item, i) {
                    if (typeof item === 'string' && item.indexOf('babel-loader') > -1) {
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
        var simpleLoaderReg = /^\w+$/;

        if (Array.isArray(loader)) {
            loader.map(function (loaderItem) {
                if (simpleLoaderReg.test(loaderItem.loader)) {
                    loaderItem.loader += '-loader';
                }
            });
        }

        return loader;
    }

    return config;
}

function handleNotAllowedConfig(config) {
    var innerConfigNames = ['cwd', 'sync', 'projectCwd', 'envParams', 'fekitDomainMappingList', 'requireRules', 'entryExtNames', 'getVendor', 'middleware'];

    var warnConfigNames = ['postcss' // FIXME 这里要考虑兼容情况
    ];

    innerConfigNames.map(function (configName) {
        delete config[configName];
    });

    warnConfigNames.map(function (configName) {
        logWarn('Not supported props on the config object: ' + configName);
        delete config[configName];
    });

    return config;
}