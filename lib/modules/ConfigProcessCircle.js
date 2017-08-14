'use strict';

var ConfigConverter = require('./ConfigConverter.js');

module.exports = {
    runBeforeCompiling: function runBeforeCompiling(baseWebpackConfig) {
        return ConfigConverter(baseWebpackConfig);
    }
};