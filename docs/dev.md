<h1 style="font-weight: normal"> 为Ykit贡献代码 </h1>

<h2 style="font-weight: normal"> 工程结构 </h2>

ykit核心代码基本都在src目录下:

```
├── commands - ykit命令
├── config - 静态文件如初始化工程模板等
├── models - ykit核心（如编译打包）
├── modules - 功能模块
├── plugins - webpack plugins
└── utils - 工具
```

src会通过gulp编译到lib对应目录下，将src中的es6编译为es5，ykit运行是使用es5的代码，所以开发过程中要一直开着gulp。

<h2 style="font-weight: normal"> 本地开发 </h2>

1. fork & clone git 工程
2. qnpm install
3. gulp
4. node /bin/ykit 进行开发和调试

<h2 style="font-weight: normal"> Ykit插件 </h2>

Ykit对于不同场景的覆盖主要通过插件来实现。插件有两种，一种是功能/技术解决方案插件（如qunar/hy/fekit），一种是业务插件（如xta），目前已有的插件:

- [ykit-config-qunar][1]: 支持sass/less，实现资源带版本号，fekit_moudles打包，sync命令等。
- [ykit-config-fekit][2]: 主要用于兼容fekit模块化语法，如css中的require等。
- [ykit-config-hy][3]: 支持es6，更多功能仍在开发中。
- [ykit-config-xta][4]: xta业务团队插件，可在里面引用其它功能插件，和定义团队自己的lint规则，自定义插件、服务中间件、命令等。

未来将会有更多技术解决方案插件如 react-native，以及更多业务团队插件...

[1]: http://gitlab.corp.qunar.com/mfe/ykit-config-qunar
[2]: http://gitlab.corp.qunar.com/mfe/ykit-config-fekit
[3]: http://gitlab.corp.qunar.com/mfe/ykit-config-hy
[4]: http://gitlab.corp.qunar.com/mfe/ykit-config-xta
