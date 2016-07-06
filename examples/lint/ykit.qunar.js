exports.config = (conf) => {
    conf.setExports([
        './scripts/index.js',
        './styles/index.css',
    ]);
};

exports.commands = [{
    name: 'project_cmd',
    module: {
        usage: '项目自定义的命令',
        process: () => {}
    }
}];
