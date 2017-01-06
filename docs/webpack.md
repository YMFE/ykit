由于 Ykit 是基于 Webpack 的，因此迁移 Webapck 项目只需要原有配置进行迁移。

<h2 style="font-weight: normal"> 1. 创建配置文件 </h2>

在项目目录下创建一个名为 `ykit.js` 的配置文件（如果使用某种类型的插件，则为 `ykit.{type}.js`），配置文件示例可参考 [Ykit-配置][1]。

<h2 style="font-weight: normal"> 2. 配置 modifyWebpackConfig </h2>

编辑配置文件，以下为配置示例：
```
exports.config = function() {
    return {
        // 将 webpack 中的入口改为数组的形式，放在 export 中
        export: [
            './scripts/index.js'
            './styles/index.scss'
        ],
        modifyWebpackConfig: function(baseConfig) {

            // 配置编译方式（配置形式同 webapck）
            baseConfig.module = {
                loaders: [
                    {
                        test: /\.jsx?$/,
                        loader: 'babel',
                        query: {
                            presets: ['es2015', 'react']
                        }
                    }
                ]
            };

            // 更多 webapck 的配置可以直接 copy 过来
            // ...

            return baseConfig;
        }
    };
};
```

具体配置文档可参考 [Ykit-配置][1]。

<h2 style="font-weight: normal"> 3. 执行 ykit pack 验证编译打包结果 </h2>

默认会打包至项目的 `dev` 目录下。

[1]: ./docs-配置.html
