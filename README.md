# Ykit [![CircleCI](https://circleci.com/gh/YMFE/ykit.svg?style=shield)](https://circleci.com/gh/YMFE/ykit)

Ykit 是一个基于 Webpack 的打包工具，它封装了多种 JavaScript 应用的配置在插件中，安装上插件即可开始构建适合你的 App。Ykit 内置了各种优化和辅助插件，让你的应用开发更稳定、高效。

## Quick Start

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

## Config Options

- **plugins** - 插件是对一类配置和功能的封装，通过安装插件可以快速搭建开发环境。
- **config.exports** - 资源入口
- **config.modifyWebpackConfig** - 用来更改 Webpack 现有配置的函数
- **hooks** - 打包过程钩子
- **commands** - 自定义命令

## Examples

- [ykit-starter-yo][2]
- [ykit-starter-react][3]
- [ykit-starter-vue][4]

## Document

访问 [http://ued.qunar.com/ykit/][1] 来获取更多 ykit 的文档。

[1]: http://ued.qunar.com/ykit/index.html
[2]: https://github.com/roscoe054/ykit-starter-yo
[3]: https://github.com/roscoe054/ykit-starter-react
[4]: https://github.com/roscoe054/ykit-starter-vue
