const ConfigConverter = require('./ConfigConverter.js');

module.exports = {
    runBeforeCompiling: function(baseWebpackConfig) {
        return ConfigConverter(baseWebpackConfig);
    }
};
