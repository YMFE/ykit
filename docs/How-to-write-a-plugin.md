每一个插件都是一个 npm 模块，命名规则为 `ykit-config-<name>`，比如 `ykit-config-yo`。

## 创建一个插件

最简单的方法是 fork 一份 [ykit-config-seed][2]，根据需求在 `index.js` 中添加自己的内容。

### 配置

从插件中可以修改 Webapck 配置，配置的优先级关系是 `项目配置 > 插件配置 > ykit基础配置`。

在 `index.js` 的配置函数中，我们可以通过 `this.config` 获取到当前 webpack 配置，并对其进行修改。

```javascript
exports.config = function () {
    // 通过 extend 扩展配置对象
    extend(true, this.config, {
        module: this.config.module.loaders.concat[{
            test: /\.js|jsx$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel',
            query: {
                presets: [
                    'babel-preset-es2015',
                    'babel-preset-react'
                ]
            }
        }]
    });
};
```

### 脚手架

插件中可以包含脚手架，并通过 ykit 一键初始化项目。

ykit 支持 init 过程中寻找插件，命令规则为 `ykit init <plugin-name>`，比如 `ykit init yo`。则会在当前目录下初始化项目，并为之安装 `ykit-config-yo`
 这个插件。

安装结束后 ykit 会自动执行该插件中的 `setup` 命令，在这个命令中我们可以进行复制模板、安装第三方 npm 模块等操作。具体详见下方`自定义命令`部分和 [ykit-config-seed][2] 中的命令模板。

### 构建钩子

通过插件，我们可以在构建（`ykit pack`）结束时触发一系列回调函数：

```javascript
exports.config = function () {
    this.packCallbacks.push(function(opt, stats) {
        // opt 代表 pack 命令后面跟的参数对象，stats 代表编译结束后的结果信息
        if (opt.m || opt.min) {
            // 如果当前命令是 pack -m 或 pack --min
            // 打印出本次 pack 出的资源名称
            var statsInfo = stats.toJson({errorDetails: false})
            statsInfo.assets.map(function(asset) {
                console.log(asset.name)
            });
        }
    })
};
```

### 自定义命令

自定义命令使得在当前项目目录下可以执行一段 node 脚本。通过 `this.commands` 添加，如：

```javascript
exports.config = function () {
    this.commands.push({
        name: '<command_name>',
        module: require('./commands/<command_name>.js')
    })
};
```

添加过后，在每个安装了该插件的项目中，就可以执行 `ykit <command_name>` 命令了。

## 发布插件

编辑 `package.json` 中的模块名称、版本号等信息，执行 `npm publish` 即可。

如果想加入官方插件请联系 `yuhao.ju`。

[1]: http://gitlab.corp.qunar.com/mfe/ykit-config-qunar
[2]: http://gitlab.corp.qunar.com/mfe/ykit-config-seed
[3]: https://docs.npmjs.com/misc/developers
