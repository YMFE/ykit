module.exports = {
    plugins: @PLUGIN_NAME,
    config: {
        exports: [
            './scripts/index.js',
            './styles/index.css'
        ],
        modifyWebpackConfig: function(baseConfig) {
            // edit ykit's Webpack configs

            return baseConfig;
        }
    },
    hooks: {},
    commands: []
};
