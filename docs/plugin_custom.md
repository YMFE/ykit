<h2 style="font-weight: normal"> 自定义插件 </h2>

自定义插件设计的初衷是**让开发团队针对自身整合一套开发环境**，在其中可以添加/修改编译规则以及编译插件，加入更多开发工具，添加自定义命令，设计团队 lint 规则等等。

自定义插件示例：[ykit-config-qunar][1]。

<h2 style="font-weight: normal"> 自定义插件的编写 </h2>

**注意：为了使 build 机器（node 0.12）可以正常编译，插件内部必须使用 es5 语法。**

插件主要有三大功能：更改编译中间过程、添加编译回调、自定义命令。

<h3 style="font-weight: normal"> 更改编译中间过程 </h3>

编译过程是一个不断更改 webapck 配置的过程，遵循 ykit基础配置 => 插件配置 => 业务配置 的流程。

插件中可以从 `this.config` 获取到当前 webpack 配置，并对其进行修改。
比如为某种后缀文件添加/修改 loader，下面例子修改了 scss 的 loader：

```
this.config.module.loaders = this.config.module.loaders.map(function(loader) {
    // 匹配到之前的并替换
    if(loader.test.test('.scss')){
        return {
            test: /\.(sass|scss)$/,
            loader: options.ExtractTextPlugin.extract(
                require.resolve('style-loader'),

                // 将 loader 替换为自己的
                require.resolve('css-loader')
                    + '?sourceMap!'
                    + require.resolve('@qnpm/ykit-config-qunar/loaders/sass.js') + '?sourceMap'
            )
        }
    }
    return loader
})
```

<h3 style="font-weight: normal"> 添加编译回调 </h3>

编译回调是在整体编译结束后调用的方法。通过 `this.packCallbacks` 添加，如：

```
// opt 是 pack 命令后面跟的参数，stats 是编译结束后的结果数据，以下代码输出了每个打包资源的名字。
this.packCallbacks.push(function(opt, stats) {
    if (opt.m || opt.min) {
        var statsInfo = stats.toJson({
            errorDetails: false
        })

        statsInfo.assets.map(function(asset) {
            console.log(asset.name)
        });
    }
})
```

<h3 style="font-weight: normal"> 添加自定义命令 </h3>

自定义命令使得在当前项目目录下可以执行一段 node 脚本。通过 `this.commands` 添加，如：

```
this.commands.push({
    name: 'my_command',
    module: require('./commands/my_command.js')
})
```

添加过后，在每个安装了该插件的项目中，就可以执行 ykit my_command 命令了。

[1]: http://gitlab.corp.qunar.com/mfe/ykit-config-qunar
