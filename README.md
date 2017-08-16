# Ykit [![CircleCI](https://circleci.com/gh/YMFE/ykit.svg?style=shield)](https://circleci.com/gh/YMFE/ykit)

Ykit 是一个基于 Webpack 的打包工具，它利用插件机制封装了各种 JavaScript 应用的配置，选择和安装合适的插件即可开始构建你的 App。Ykit 内置了各种优化和辅助工具，让你的应用开发更稳定、高效。

## 特性

1. 包含 hot reloading 本地 server，无需在项目中配置
2. 比 Webpack 更快的编译打包速度
3. 通过插件可快速定制开发环境
4. 内置 eslint 和代理工具

## 和 Webpack 性能对比

本地 server 访问页面资源加载和页面渲染时间：

| 资源数 | Webpack 耗时 | Ykit 耗时 |
|---------|-------|-------|
| 3 assets | 9s | 5s |
| 10 assets | 18s | 5s |
| 20 assets | 33s | 5s |

build（包含压缩）时间：

| 资源数 | Webpack 耗时 | Ykit 耗时 |
|---------|-------|-------|
| 3 assets | 10s | 7s |
| 10 assets | 20s | 16s |
| 20 assets | 38s | 32s |

测试工程：[https://github.com/roscoe054/ykit-benchmark](https://github.com/roscoe054/ykit-benchmark)

## 快速开始

1. `npm install ykit -g`
2. `mkdir ykit-app && cd ykit-app`
3. `ykit init`
4. `cd .. && ykit server`
5. 用浏览器访问 `http://localhost/ykit-app/index.html`

初始化结束后，项目中会生成一个名为 `ykit.js` 的配置文件：

```javascript
module.exports = {
    plugins: [],
    config: {
        export: ['./scripts/index.js', './styles/index.css'],
        modifyWebpackConfig: function modifyWebpackConfig(baseConfig) {
            // 更改 Webpack 配置
            return baseConfig;
        }
    },
    hooks: {},
    commands: []
};
```

## 配置文件选项

- **plugins** - 插件是对一类配置和功能的封装，通过安装插件可以快速搭建开发环境
- **config.exports** - 资源入口
- **config.modifyWebpackConfig** - 用来更改 Webpack 现有配置的函数
- **hooks** - 打包过程钩子
- **commands** - 自定义命令

## 范例

通过插件快速搭建不同类型的应用，可参考以下示例。

- [ykit-starter-yo][2]
- [ykit-starter-react][3]
- [ykit-starter-vue][4]
- [ykit-starter-antd][5]

## 文档

访问 [http://ued.qunar.com/ykit/][1] 来获取更多 ykit 的文档。

[1]: http://ued.qunar.com/ykit/index.html
[2]: https://github.com/roscoe054/ykit-starter-yo
[3]: https://github.com/roscoe054/ykit-starter-react
[4]: https://github.com/roscoe054/ykit-starter-vue
[5]: https://github.com/roscoe054/ykit-starter-antd
