module.exports = {
    runTasksBeforeCompiling(hooks, webpackConfig) {
        const removeDuplicateBabelLoader = function(rules, plugins) {
            const babelExists = rules.some((rule) => {
                const isFromYkit = rule.test.toString().match(/__ykit__/);

                if(isFromYkit) {
                    return false;
                } else {
                    const isRuleForJS = rule.test.toString().match(/js/);
                    const ruleUse = typeof rule.use === 'string' ? rule.use : rule.use.join();
                    const isUsingBabel = ruleUse.includes('babel') || ruleUse.includes('happypack');
                    return isRuleForJS && isUsingBabel;
                }
            });

            if(babelExists) {
                rules = rules.filter((rule) => {
                    return !rule.test.toString().match(/__ykit__/);
                });
                plugins = plugins.filter((plugin) => {
                    return !plugin.__ykit__;
                });
            }

            return {rules, plugins};
        };

        return new Promise ((resolve, reject) => {
            async.series(
                hooks.beforeCompiling.map((beforeTask) => {
                    return (callback) => {
                        let isAsync = false;
                        beforeTask.bind({
                            async: () => {
                                isAsync = true;
                                return callback;
                            }
                        })(webpackConfig);

                        if(!isAsync) {
                            callback(null);
                        }
                    };
                }),
                (err) => {
                    if(err) {
                        logError(err);
                        process.exit(1);
                    }

                    const results = removeDuplicateBabelLoader(
                        webpackConfig.module.rules,
                        webpackConfig.plugins
                    );
                    webpackConfig.module.rules = results.rules;
                    webpackConfig.plugins = results.plugins;

                    resolve(webpackConfig);
                }
            );
        });
    }
};
