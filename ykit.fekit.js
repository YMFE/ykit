exports.config = function(options, cwd) {
    return {
        export: [
            'scripts/index.js',
            'styles/index.scss',
            {
                name: 'common',
                export: [
                    './common/util.js',
                    './common/util.css'
                ]
            }
        ],
        modifyWebpackConfig: function(baseConfig) {
            baseConfig.context = './src'
            return baseConfig
        },
        sync: {
            host: "192.168.237.71",
            path: "/home/q/www/qunarzz.com/ykit"
        },
        commands: [{
            name: 'ykit-seed-avalon_cmd',
            module: {
                usage: '项目自定义命令',
                run: function() {}
            }
        }]
    }
};
