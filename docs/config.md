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

- export - 设置资源入口。与 Fekit 相同，其中所有路径均默认相对于`src`目录，在**本地请求 / 打包阶段**，将会导出至 **prd / dev** 目录。同时也支持设置入口分组，打包时可针对分组进行打包。
- sync - 设置同步开发机的配置，需要设置开发机的 IP，以及项目要存储的路径。
- command - 设置项目自定义命令，在项目目录下执行`ykit {cmd}`即可运行。

<h3 style="font-weight: normal"> modifyWebpackConfig </h3>

`modifyWebpackConfig`是一个可选的配置方法，来修改当前默认的 webpack 配置。比如添加新的 webpack 插件，修改某种类型文件的 loader 等等。如果涉及比较复杂的操作（如替换 loader），可使用 **[webpack-merge][2]**。

- 示例 - 添加 plugins：

```js
modifyWebpackConfig: function(baseConfig) {
    var webpack = require('webpack');
    var newPlugin = new webpack.DefinePlugin({
        "process.env": {
            NODE_ENV: JSON.stringify("production")
        }
    })

    baseConfig.plugins.push(newPlugin);
    return baseConfig;
}
```

- 示例 - 修改 output：

```js
modifyWebpackConfig: function(baseConfig) {
    baseConfig.output: {
        /**
         * output 是 webpack 中对于编译结果的配置
         * 在 ykit 中，根据每个环境(local / dev / prd)有特定的编译结果配置
         * 可以对特定环境下的 output 进行修改或重置
         */

        local: {
            // 重置本地 server 环境下配置
        },
        dev: baseConfig.output.dev, // 沿用 dev 环境下配置
        prd: baseConfig.output.prd  // 沿用 prd 环境下配置
    }
    return baseConfig;
}
```

<h2 style="font-weight: normal"> 配置函数上下文 </h2>

业务在 ykit.{type}.js 中的配置函数上下文可以获取到当前的环境信息。

- env: 当前 ykit 的执行环境，分为 `local / dev / prd`，示例：

```js
modifyWebpackConfig: function(baseConfig) {
    switch (this.env) {
        case 'local':
            // 修改本地环境配置，在 ykit server 中访问项目会生效
            break;
        case 'dev':
            // 修改开发环境配置，在 ykit pack 时生效
            break;
        case 'prd':
            // 修改生产环境配置，在 ykit pack -m 时生效
            break;
        default:
    }

    return baseConfig;
}
```

[1]: https://webpack.github.io/docs/configuration.html
[2]: https://github.com/survivejs/webpack-merge
