## 插件

**Ykit 插件是对一类配置和功能的封装**。它可以包含 Webpack 配置和插件、脚手架、第三方 npm 模块、自定义命令、构建钩子、lint 规则等等。

通过安装插件开发者可以获取到这些配置和功能来快速搭建开发环境。

## 插件安装

### 安装 npm 包

插件命名格式均为`ykit-config-{插件名}`，通过以下命令在项目中安装插件：

```
$ npm install ykit-config-{插件名} --save
```

如果是带有`@qnpm`前缀的插件，则需要指定 qnpm 仓库（只有内网环境下可用），如：

```
$ npm install @qnpm/ykit-config-{插件名} --save --registry http://registry.npm.corp.qunar.com/
```

### 引入

在 `ykit.js` 配置文件中，传入一个插件名的数组来引入插件。这些插件将在 Ykit 执行前加载进来。如果有相同的配置，后面的插件会覆盖前面的。

```javascript
module.exports = {
    plugins: ['qunar', 'react'],
    // ...
};
```
