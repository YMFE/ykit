"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
    runTasksBeforeCompiling: function runTasksBeforeCompiling(hooks, webpackConfig) {
        var removeDuplicateBabelLoader = function removeDuplicateBabelLoader(rules) {
            return rules;
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

                resolve(webpackConfig);
            });
        });
    }
};