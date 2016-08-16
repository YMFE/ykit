exports.config = function() {
    // 项目资源入口
    this.setExports([
        // './scripts/index.js',
        // './styles/index.css'
    ]);

    // 编译环境配置
    this.setCompiler({
        context: './src'
    });

    // sync到开发机配置
    this.setSync({
        host : "192.168.237.71",
        path: "/home/q/www/qunarzz.com/#_name"
    });

    // 自定义命令
    this.setCommands([
        {
            name: '#_name_cmd',
            module: {
                usage: '项目自定义命令',
                run: function () {}
            }
        }
    ]);
};
