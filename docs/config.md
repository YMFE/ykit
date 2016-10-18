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

`modifyWebpackConfig`是一个可选的配置方法，来修改当前默认的 webpack 配置。比如添加新的 webpack 插件，修改某种类型文件的 loader 等等。

- modifyWebpackConfig - 添加编译插件

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

- modifyWebpackConfig - 更改 js 编译方式

由于基础配置中存在 js loader，因此如果需要修改它，则要将其匹配出来，并进行替换：

```js
modifyWebpackConfig: function(baseConfig) {
    var webpack = require('webpack');

    baseConfig.module = {
        loaders: config.module.loaders.map((loader) => {
            if (loader.test.test('.js')) {
                return {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel',
                    query: {
                        presets: ['es2015', 'react', 'stage-0']
                    }
                }
            }
            return loader;
        })
    };

    return baseConfig;
}
```

[1]: https://webpack.github.io/docs/configuration.html
