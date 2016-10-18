<h1 style="font-weight: normal"> 使用插件 </h1>

Ykit 通过插件来扩展基础配置：

![配置流程](http://ww2.sinaimg.cn/large/6af705b8gw1f8w9jkb8ffj20q308rmxr.jpg)

<h2 style="font-weight: normal"> 插件安装与引入 </h2>

插件命名格式均为`ykit-config-{插件名}`，并且目前都是在`@qnpm`域下，在项目中通过 npm 安装插件：

```bash
$ sudo npm install @qnpm/ykit-config-{插件名} --registry http://registry.npm.corp.qunar.com/
```

安装插件后无需特殊引入，只要保证项目内的 ykit 配置文件`ykit.{插件名}.js`与使用的插件名对应即可。如安装了插件`@qnpm-ykit-config-qunar`，则配置文件命名为`ykit.qunar.js`。

<h2 style="font-weight: normal"> 技术解决方案插件 </h2>

总的来说，插件分为两种，**技术解决方案插件**和**自定义插件**。

技术解决方案插件由 Ykit 提供，以便于快速搭建不同的开发环境：

<h3 style="font-weight: normal"> ykit-config-qunar </h3>

- 添加 SASS 和 LESS 编译模块。
- 实现资源入口从`src`到`prd & dev`的映射。
- 添加`ykit sync`命令，同步代码至开发机。
- 添加`ykit source`命令，上传静态资源。
- 支持引入`fekit_moudles`

<h3 style="font-weight: normal"> ykit-config-fekit </h3>

- 继承自 ykit-config-qunar。
- 兼容 Fekit 模块引用特殊语法（如 CSS 中 require 另一样式文件）。

<h3 style="font-weight: normal"> ykit-config-hy </h3>

- 继承自 ykit-config-qunar。
- 添加 ES6 编译模块。
- 添加 ES6 Lint 规则。
- 内置 Hy2 (开发中)。

<h2 style="font-weight: normal"> 自定义插件 </h2>

自定义插件设计的初衷是**让开发团队针对自身整合一套开发环境**，在其中可以添加/修改编译规则以及编译插件，加入更多开发工具，添加自定义命令，设计团队 lint 规则等等。

自定义插件示例：[ykit-config-xta][1]。

**更多有关开发自定义插件的文档在编写中...**

[1]: http://gitlab.corp.qunar.com/mfe/ykit-config-xta
