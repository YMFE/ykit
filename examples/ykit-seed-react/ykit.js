'use strict';

module.exports = {
    plugins: ['react'],
    config: {
        export: ['./scripts/index.js', './styles/index.css'],
        modifyWebpackConfig: function modifyWebpackConfig(baseConfig) {
            // edit ykit's Webpack configs
            return baseConfig;
        }
    }
};
