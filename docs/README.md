<h1 style="font-weight: normal"> 简介 </h1>

Ykit 是一套可配置和可扩展的前端开发工具集，核心功能包括资源打包、静态资源服务、代码质量检测。Ykit 基于 [webpack][1]，支持 CommonJs, AMD, ES6 modules, Coffeescript, CSS, SASS, LESS 等模块类型的打包。

<h2 style="font-weight: normal"> Feature </h2>

- 可支持当前 Qunar 打包格式，如打包生成`dev`和`prd / ver`目录，资源版本号等。
- 按请求编译（比 webpack 的首次编译全部 entry 要快），实时服务只编译改动文件（比 fekit 每次编译所有请求资源要快）。
- 支持 export 分组，按组打包，不必每次打包全部。
- 自带lint命令，支持 eslint 和 stylelint，并可通过 lint 命令配置 pre-commit。
- 自带代理工具，可实现 SwitchHost + Charles 的基本功能。

<h2 style="font-weight: normal"> 安装(需要在内网环境下) </h2>

```bash
$ sudo npm install @qnpm/ykit -g --registry http://registry.npm.corp.qunar.com/
```

<h2 style="font-weight: normal"> Examples </h2>

- [ykit-seed-avalon][6]: 使用 Avalon1.4.7、OniUI0.5.3，fekit 格式输出
- [ykit-seed-hy][7]: Ykit 结合 Hy Demo, 包括路由功能、滚动组件、手势功能
- [ykit-seed-react][8]: React 示例，支持 ES6、SASS、LESS，fekit 格式输出

clone 下来后 npm install，然后用 ykit 运行，具体看 demo 中 README.md。

<h2 style="font-weight: normal"> Others </h2>

Ykit 仍处在开发迭代阶段，有需求和问题可以[点击这里][9]提 issue，或直接 qtalk 找 yuhao.ju，也欢迎为 YKit [贡献代码][10]。

<h2 style="font-weight: normal"> Change log </h2>

[查看change log][11]

[1]: https://github.com/webpack/webpack
[2]: http://gitlab.corp.qunar.com/mfe/ykit/wikis/project-init
[3]: http://gitlab.corp.qunar.com/mfe/ykit/wikis/config
[4]: http://gitlab.corp.qunar.com/mfe/ykit/wikis/cli-command
[5]: http://gitlab.corp.qunar.com/mfe/ykit/wikis/Node-API
[6]: http://gitlab.corp.qunar.com/yuhao.ju/ykit-seed-avalon
[7]: http://gitlab.corp.qunar.com/yuhao.ju/ykit-seed-hy
[8]: http://gitlab.corp.qunar.com/yuhao.ju/ykit-seed-react
[9]: http://gitlab.corp.qunar.com/mfe/ykit/issues
[10]: ./dev.html
[11]: http://gitlab.corp.qunar.com/mfe/ykit/blob/master/CHANGELOG.md
[12]: http://gitlab.corp.qunar.com/mfe/ykit/wikis/proxy
