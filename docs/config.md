<h1 style="font-weight: normal"> 配置 </h1>

<h2 style="font-weight: normal"> ykit.{type}.js 文件示例 </h2>

```js
exports.config = function() {
    return {
        export: [
            // 项目资源入口
            './scripts/index.js',
            './styles/index.scss',

            // 项目资源分组
            {
                name: 'common',
                export: [
                    './common_dir/util.js',
                    './common_dir/common.css'
                ]
            }
        ],
        modifyWebpackConfig: function(baseConfig) {
            // 修改 webpack 编译配置
            // ...

            return baseConfig
        },
        sync: {
            // sync到开发机配置
            host: "192.168.237.71",
            path: "/home/q/www/qunarzz.com/#_name"
        },
        command: [{
            name: '#_name_cmd',
            module: {
                usage: '项目自定义命令',
                run: function() {}
            }
        }]
    }
};

```

<h2 style="font-weight: normal"> 配置项 </h2>

- export - 设置资源入口。将要导出至 prd 和 dev 目录的文件列表。其中所有路径, 均相对于 src 目录，同时也支持设置入口分组。
- sync - 设置同步开发机的配置，需要设置开发机的ip，以及项目要存储的路径。
- command - 设置项目自定义命令，在项目目录下执行ykit {cmd}即可运行。

<h3 style="font-weight: normal"> modifyWebpackConfig </h3>

`modifyWebpackConfig`是一个可选的配置方法，来修改当前默认的 webpack 配置。比如添加新的 webpack 插件，修改某种类型文件的 loader 等等。

[1]: https://webpack.github.io/docs/configuration.html
