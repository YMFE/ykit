'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
    runTasksBeforeCompiling: function runTasksBeforeCompiling(hooks, webpackConfig) {
        var removeDuplicateBabelLoader = function removeDuplicateBabelLoader(rules, plugins) {
            var babelExists = rules.some(function (rule) {
                var isFromYkit = rule.test.toString().match(/__ykit__/);

                if (isFromYkit) {
                    return false;
                } else {
                    var isRuleForJS = rule.test.toString().match(/js/);
                    var ruleUse = typeof rule.use === 'string' ? rule.use : rule.use.join();
                    var isUsingBabel = ruleUse.includes('babel') || ruleUse.includes('happypack');
                    return isRuleForJS && isUsingBabel;
                }
            });

            if (babelExists) {
                rules = rules.filter(function (rule) {
                    return !rule.test.toString().match(/__ykit__/);
                });
                plugins = plugins.filter(function (plugin) {
                    return !plugin.__ykit__;
                });
            }

            return { rules: rules, plugins: plugins };
        };

        return new _promise2.default(function (resolve, reject) {
            async.series(hooks.beforeCompiling.map(function (beforeTask) {
                return function (callback) {
                    var isAsync = false;
                    beforeTask.bind({
                        async: function async() {
                            isAsync = true;
                            return callback;
                        }
                    })(webpackConfig);

                    if (!isAsync) {
                        callback(null);
                    }
                };
            }), function (err) {
                if (err) {
                    logError(err);
                    process.exit(1);
                }

                var results = removeDuplicateBabelLoader(webpackConfig.module.rules, webpackConfig.plugins);
                webpackConfig.module.rules = results.rules;
                webpackConfig.plugins = results.plugins;

                resolve(webpackConfig);
            });
        });
    }
};