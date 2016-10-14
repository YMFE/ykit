<h1 style="font-weight: normal"> 为 Ykit 贡献代码 </h1>

<h2 style="font-weight: normal"> 工程结构 </h2>

ykit 核心代码基本都在src目录下:

```
├── commands - ykit命令
├── config - 静态文件如初始化工程模板等
├── models - ykit核心（如编译打包）
├── modules - 功能模块
├── plugins - webpack plugins
└── utils - 工具
```

`src`会通过 gulp 编译到`lib`对应目录下，将 sr c中的 es6 编译为 es5 ，ykit运行是使用 es5 的代码，所以开发过程中要一直开着 gulp。

<h2 style="font-weight: normal"> 本地开发 </h2>

1. fork & clone git 工程
2. qnpm install
3. gulp
4. node /bin/ykit 进行开发和调试

<h2 style="font-weight: normal"> Ykit插件 </h2>

Ykit 对于不同场景的覆盖主要通过插件来实现。插件有两种，一种是功能/技术解决方案插件（如 qunar/hy/fekit），一种是业务插件（如 xta ），目前已有的插件:

- [ykit-config-qunar][1]: 支持 sass/less，实现资源带版本号，fekit_moudles 打包，sync 命令等。
- [ykit-config-fekit][2]: 主要用于兼容 fekit 模块化语法，如 css 中的 require 等。
- [ykit-config-hy][3]: 支持 es6，更多功能仍在开发中。
- [ykit-config-xta][4]: xta 业务团队插件，可在里面引用其它功能插件，和定义团队自己的 lint 规则，自定义插件、服务中间件、命令等。

未来将会有更多技术解决方案插件如 react-native，以及更多业务团队插件...

[1]: http://gitlab.corp.qunar.com/mfe/ykit-config-qunar
[2]: http://gitlab.corp.qunar.com/mfe/ykit-config-fekit
[3]: http://gitlab.corp.qunar.com/mfe/ykit-config-hy
[4]: http://gitlab.corp.qunar.com/mfe/ykit-config-xta
