# Ykit

- - -

Ykit是一套可配置和可扩展的前端开发工具集，核心功能包括资源打包、静态资源服务、代码质量检测。Ykit基于[webpack][1]，支持CommonJs, AMD, ES6 modules, Coffeescript, CSS, SASS, LESS等模块类型的打包。

### Feature

- 可支持当前Qunar打包格式，如打包生成dev和prd / ver目录，资源版本号等。
- 按请求编译（比webpack的首次编译全部entry要快），实时服务只编译改动文件（比fekit每次编译所有请求资源要快）。
- 支持export分组，按组打包，不必每次打包全部。
- 自带lint命令，支持eslint和stylelint，并可通过lint命令配置pre-commit。
- 自带代理工具，可实现SwitchHost + Charles的基本功能。

### 安装(需要在内网环境下)

```bash
$ sudo npm install @qnpm/ykit -g --registry http://registry.npm.corp.qunar.com/
```

### Wiki

- [项目初始化][2]
- [项目迁移][3]
- [CLI 命令][4]
- [Node.js API][5]

### Examples

- [ykit-seed-avalon][6]: 使用Avalon1.4.7、OniUI0.5.3，fekit格式输出
- [ykit-seed-hy][7]: Ykit结合Hy Demo, 包括路由功能、滚动组件、手势功能
- [ykit-seed-react][8]: React示例，支持ES6、SASS、LESS，fekit格式输出

clone下来即可用ykit运行，具体看demo中README.md。

### others

Ykit仍处在开发迭代阶段，有需求和问题可以[点击这里][9]提issue，或直接qtalk找yuhao.ju。也欢迎为YKit[贡献代码][10]。

[1]: https://github.com/webpack/webpack
[2]: http://gitlab.corp.qunar.com/mfe/ykit/wikis/project-init
[3]: http://gitlab.corp.qunar.com/mfe/ykit/wikis/project-transfer
[4]: http://gitlab.corp.qunar.com/mfe/ykit/wikis/cli-command
[5]: http://gitlab.corp.qunar.com/mfe/ykit/wikis/Node-API
[6]: http://gitlab.corp.qunar.com/yuhao.ju/ykit-seed-avalon
[7]: http://gitlab.corp.qunar.com/yuhao.ju/ykit-seed-hy
[8]: http://gitlab.corp.qunar.com/yuhao.ju/ykit-seed-react
[9]: http://gitlab.corp.qunar.com/mfe/ykit/issues
[10]: http://gitlab.corp.qunar.com/mfe/ykit/wikis/ykit-dev
