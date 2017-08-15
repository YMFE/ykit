module.exports = {
    runBeforeCompiling(hooks, webpackConfig) {
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
                    resolve();
                }
            );
        });
    }
};
