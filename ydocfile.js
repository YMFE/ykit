module.exports = {
    name: 'Ykit',
    dest: './docs/dist',
    common: { // 通用配置，包括主页配置等
        title: 'YKit',
        footer: '&copy; 2016 <a href="http://ued.qunar.com/ymfe/">YMFE Team</a>. Build by <a href="http://github.com/YMFE/ydoc">ydoc</a>',
        home: 'YMFE',
        homeUrl: 'http://ued.qunar.com/ymfe/',
        navbars: []
    },
    pages: [{
        name: 'index',
        title: '简介',
        compile: 'markdown',
        menuLevel: 2,
        content: './docs/README.md'
    }, {
        name: 'init',
        title: '起步',
        compile: 'markdown',
        menuLevel: 2,
        content: './docs/init.md'
    }, {
        name: 'docs',
        title: '使用手册',
        content: {
            sidebar: true,
            multi: true,
            index: './docs/config.md',
            compile: 'markdown',
            menuLevel: 2,
            pages: [{
                name: '配置',
                content: './docs/config.md'
            }, {
                name: '命令行',
                content: './docs/cli.md'
            },  {
                name: '代理工具',
                content: './docs/proxy.md'
            }, {
                name: 'Node.js API',
                content: './docs/api.md'
            }, {
                name: '打包 JOB',
                content: './docs/build.md'
            }]
        }
    }, {
        name: 'dev',
        title: '开发者',
        compile: 'markdown',
        menuLevel: 2,
        content: './docs/dev.md'
    }]
};
