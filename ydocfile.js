module.exports = {
    name: 'Ykit',
    dest: './docs/dist',
    common: { // 通用配置，包括主页配置等
        title: '',
        footer: '&copy; 2016 <a href="http://ued.qunar.com/ymfe/">YMFE Team</a>. Build by <a href="http://github.com/YMFE/ydoc">ydoc</a>',
        home: 'YMFE',
        homeUrl: 'http://ymfe.org/',
        navbars: []
    },
    pages: [{
        name: 'index', // Page Name 会根据他生成 html 文件，例  index.html
        title: 'Ykit', // Page Title
        banner: { // Banner 配置
            title: 'Ykit',
            description: '前端开发工具集'
        },
        content: {
            multi: true, // 多页配置
            sidebar: true, // 是否显示侧边目录
            index: './docs/README.md', // 内容
            pages: [{
                name: '简介', // 标题
                content: './docs/README.md' // 内容
            }, {
                name: '项目初始化 & 项目迁移', // 标题
                content: './docs/init.md' // 内容
            }, {
                name: '配置',
                content: './docs/config.md'
            }, {
                name: '命令行工具',
                content: './docs/cli.md'
            }, {
                name: '打包 JOB',
                content: './docs/build.md'
            }, {
                name: '代理工具',
                content: './docs/proxy.md'
            }, {
                name: 'Node.js API',
                content: './docs/api.md'
            }, {
                name: '为Ykit贡献代码',
                content: './docs/dev.md'
            }]
        }, // 内容
        compile: 'markdown', // 解析器，如果内容有固定的扩展名，此项可忽略
        options: { // 此 Page 用的编译器的配置
            menuLevel: 2
        }
    }]
};
