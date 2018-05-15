# YKit [![CircleCI](https://circleci.com/gh/YMFE/ykit.svg?style=shield)](https://circleci.com/gh/YMFE/ykit)

[ENGLISH DOC](./README-en.md)

YKit 是一个基于 Webpack 的打包工具，它利用插件机制封装了各种 JavaScript 应用的配置，选择和安装合适的插件即可开始构建你的应用。

## 特性

- 通过 init 命令快速初始化各种环境
- 封装各类配置，减少搭建环境工作量
- 包含 hot-reload 的本地 server

## 安装

- latest 稳定版: `[sudo] npm install ykit -g`
- 或者选择基于 Webpack@3.8.1 的最新版本：`[sudo] npm install ykit@next -g`

## 快速开始


1. 创建目录 `mkdir ykit-app && cd ykit-app`
2. 初始化工程 `ykit init`
3. 启动服务 `ykit s -p 3000`
4. 用浏览器访问 `http://127.0.0.1:3000/index.html`

初始化结束后，项目中会生成一个名为 `ykit.js` 的配置文件：

```javascript
module.exports = {
    plugins: [],
    config: {
        export: ['./scripts/index.js', './styles/index.css'],
        modifyWebpackConfig: function (baseConfig) {
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

访问 [ykit.ymfe.org][1] 来获取更多 YKit 的文档。

[1]: https://ykit.ymfe.org/
[2]: https://github.com/roscoe054/ykit-starter-yo
[3]: https://github.com/roscoe054/ykit-starter-react
[4]: https://github.com/roscoe054/ykit-starter-vue
[5]: https://github.com/roscoe054/ykit-starter-antd
