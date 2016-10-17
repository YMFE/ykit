<h1 style="font-weight: normal"> Ykit </h1>

Ykit 是一套可配置和可扩展的前端开发工具集，核心功能包括资源打包、静态资源服务、代码质量检测。Ykit 基于 [webpack][1]，支持 CommonJs, AMD, ES6 modules, Coffeescript, CSS, SASS, LESS 等模块类型的打包。

<h2 style="font-weight: normal"> Features </h2>

- 本地的静态资源编译服务。
- 通过扩展插件快速搭建开发环境。
- 自带 lint 命令，支持 eslint 和 stylelint。
- 自带代理工具，可实现 SwitchHost + Charles 的基本功能。

<h2 style="font-weight: normal"> Examples </h2>

- [ykit-seed-avalon][6]: Avalon & OniUI 示例。
- [ykit-seed-hy][7]: Hy 示例, 包括路由功能、滚动组件、手势功能。
- [ykit-seed-react][8]: React 示例，支持 ES6、SASS、LESS。

将 demo 工程 clone 下来后 npm install，然后项目外运行 ykit server 访问项目即可。

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
