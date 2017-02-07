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
    "options": {
        "insertCSS": [
            "./theme/ydoc.css"
        ],
        "hasPageName": true
    },
    "resources": {
        "theme": "./docs/theme/"
    },
    pages: [{
        name: 'index',
        title: '简介',
        banner: {
            title: 'Ykit',
            description: 'Ykit 是一套可配置和可扩展的前端开发工具集，让开发者灵活地搭建开发环境，和使用资源打包、静态资源访问、网络代理等服务。<p><a href=\"docs.html\" class=\"getting\">Getting Started</a></p><p class=\"version\">当前版本：#VERSION#</p>'
        },
        content: './docs/index.md'
    }, {
        name: 'docs',
        title: '使用手册',
        banner: {
            title: 'Ykit',
            description: 'User Manual'
        },
        content: {
            sidebar: true,
            multi: true,
            index: './docs/getting_started.md',
            compile: 'markdown',
            menuLevel: 2,
            pages: [{
                name: '起步',
                content: './docs/getting_started.md'
            },{
                name: '配置',
                content: './docs/config.md'
            }, {
                name: '命令行',
                content: './docs/cli.md'
            }, {
                name: '代理工具',
                content: './docs/proxy.md'
            }, {
                name: '发布',
                content: './docs/build.md'
            }, {
                name: '前后端版本号关联',
                content: './docs/version.md'
            }, {
                name: 'npm shrinkwrap',
                content: './docs/shrinkwrap.md'
            }, {
                name: 'Node.js API',
                content: './docs/api.md'
            }]
        }
    }, {
        name: 'plugins',
        title: '插件',
        compile: 'markdown',
        banner: {
            title: 'Ykit',
            description: 'Plugins'
        },
        menuLevel: 2,
        content: {
            sidebar: true,
            multi: true,
            index: './docs/plugin.md',
            compile: 'markdown',
            menuLevel: 2,
            pages: [{
                name: '简介',
                index: "plugins",
                content: './docs/plugin.md'
            }, {
                name: '插件列表',
            }, {
                "name": "@qnpm\/ykit-conifg-qunar",
                "index": "plugins-qunar",
                "content": "./node_modules/@qnpm/ykit-config-qunar/README.md",
                "sub": true
            }, {
                "name": "@qnpm\/ykit-conifg-fekit",
                "index": "plugins-fekit",
                "content": "./node_modules/@qnpm/ykit-config-fekit/README.md",
                "sub": true
            }, {
                "name": "ykit-conifg-hy",
                "index": "plugins-hy",
                "content": "./node_modules/ykit-config-yo/README.md",
                "sub": true
            }, {
                name: '如何写一个插件',
                index: "How-to-write-a-plugin",
                content: './docs/How-to-write-a-plugin.md'
            }]
        }
    }, {
        name: 'migrate',
        title: '项目迁移',
        compile: 'markdown',
        banner: {
            title: 'Ykit',
            description: 'Migration'
        },
        menuLevel: 2,
        content: {
            sidebar: true,
            multi: true,
            index: './docs/fekit.md',
            compile: 'markdown',
            menuLevel: 2,
            pages: [{
                name: '如何迁移 fekit 项目',
                content: './docs/fekit.md'
            }, {
                name: '如何迁移 webpack 项目',
                content: './docs/webpack.md'
            }]
        }
    }, {
        name: 'releases',
        title: '版本记录',
        banner: {
            title: 'Ykit',
            description: 'Releases'
        },
        compile: 'markdown',
        menuLevel: 2,
        content: './CHANGELOG.md'
    }]
};
