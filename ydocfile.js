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
        name: 'config',
        title: '配置',
        compile: 'markdown',
        menuLevel: 2,
        content: './docs/config.md'
    }, {
        name: 'cli',
        title: '命令行',
        compile: 'markdown',
        menuLevel: 2,
        content: './docs/cli.md'
    }, {
        name: 'build',
        title: '发布',
        compile: 'markdown',
        menuLevel: 2,
        content: './docs/build.md'
    }, {
        name: 'proxy',
        title: '代理',
        compile: 'markdown',
        menuLevel: 2,
        content: './docs/proxy.md'
    }, {
        name: 'api',
        title: 'API',
        compile: 'markdown',
        menuLevel: 2,
        content: './docs/api.md'
    }, {
        name: 'dev',
        title: '开发者',
        compile: 'markdown',
        menuLevel: 2,
        content: './docs/dev.md'
    }]
};
