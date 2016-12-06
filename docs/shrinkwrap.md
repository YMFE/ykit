<h1 style="font-weight: normal"> npm shrinkwrap </h1>

<h2 style="font-weight: normal"> 什么是 npm shrinkwrap？ </h2>

npm shrinkwrap 是 npm 包管理器的一项功能。可以按照当前项目 node_modules 目录内的安装包情况生成稳定的版本号描述。shrinkwrap 文件的结构类似以下这种形式：

```json
{
  "name": "A",
  "version": "1.1.0",
  "dependencies": {
    "B": {
      "version": "1.0.1",
      "from": "B@^1.0.0",
      "resolved": "https://registry.npmjs.org/B/-/B-1.0.1.tgz",
      "dependencies": {
        "C": {
          "version": "1.0.1",
          "from": "org/C#v1.0.1",
          "resolved": "git://github.com/org/C.git#v1.0.1"
        }
      }
    }
  }
}
```

<h2 style="font-weight: normal"> 为什么需要它？ </h2>

在没有 shrinkwrap 的项目中，任意一个依赖包都可能在开发者不知情的情况下发生改动，进而引发线上故障。

在一个 JavaScript 项目中，每次执行 `npm install`，最后生成的结果可能是不一样的。譬如说现在某个项目依赖了模块 A, 虽然我们可以为它指定一个固定的版本号，然而 A 所依赖的其它模块版本使用的是 npm semver 规则（semantic version，npm 模块依赖默认遵循的规则）。它并不严格规定版本，而是选择符合当前 semver 规则的最新版本进行安装。

一个简单的例子：假如模块 A 中依赖了 B，并且在 A 的 package.json 中指定 B 的 semver 为 ~1.2.3，那么所有形式为 1.2.x 的版本都是符合规则的。当模块 B 更新了一个 1.2.x 的小版本后，项目在下次构建中就会获取到它。

semver 这样设计的初衷是使模块的开发者可以将 bugfix 等微小的改动能更便捷地到达使用方。但它的负面影响却是使每次 npm install 构建过程之间，项目内的模块内容随时可能发生改变。我们没法确定在每个模块内部，每一次小版本更新时究竟是加入了 bugfix，还是改变了 API，亦或是注入了恶意代码。

为了保证线上构建的稳定性，我们决定强制在每个 Ykit 的项目中添加 shrinkwrap。

<h2 style="font-weight: normal"> 业务需要做什么？ </h2>

Ykit 会在一个项目 commit 之前检查并更新 `npm-shrinkwrap.json`（如果没有则会生成一个），业务需要做的只是将这个文件提交，保持它是最新的即可。当然也可以执行`npm shrinkwrap` 来进行手动更新。

<h2 style="font-weight: normal"> 错误处理 </h2>

生成 `npm-shrinkwrap.json` 过程的中报错，大多是因为 package.json 和 node_modules 中模块版本不一致（其实是不应该出现的），按照提示的错误改正即可。

![shrinkwrap 报错](http://ww1.sinaimg.cn/large/6af705b8gw1fabnozkuojj20iw09g41u.jpg)

如果还有问题请 qtalk 联系 `yuhao.ju`。
