exports.config = function() {
    this.setExports([

    ]);

    this.commands.push({
        name: 'project_cmd',
        module: {
            usage: '项目自定义的命令',
            run: function () {}
        }
    });

    this.setConfig(function(config) {
        config.context = './src';
        config.syncConfig = {
            "user": "",
            "host" : "192.168.237.71",
            "path": "/home/q/www/qunarzz.com/context-root"
        };
        return config;
    });
};
