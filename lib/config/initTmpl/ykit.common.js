'use strict';

exports.config = function () {
    return {
        export: ['./scripts/index.js', './styles/index.scss'],
        modifyWebpackConfig: function modifyWebpackConfig(baseConfig) {
            // 修改 webpack 编译配置
            // ...

            return baseConfig;
        },
        sync: {
            host: '192.168.237.71',
            path: '/home/q/www/qunarzz.com/#_name'
        },
        command: [{
            name: '#_name_cmd',
            module: {
                usage: '项目自定义命令',
                run: function run() {}
            }
        }]
    };
};