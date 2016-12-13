<h1 style="font-weight: normal"> 打包 JOB </h1>

<h2 style="font-weight: normal"> 创建 Schema </h2>

1.进入[万事屋][1]创建 Schema，注意前端类型选择`非 fekit 编译`，其它项目信息正常填写即可。

![Schema-新建](http://ww3.sinaimg.cn/large/6af705b8gw1f8v3wuuz2dj20o50dnmzn.jpg)

2.进入 Schema 公共详细信息填写界面，在 build_command 字段填写以下打包命令：

```
export PATH=/usr/local/n/versions/node/6.2.1/bin:$PATH && npm cache clean && npm install --registry http://registry.npm.corp.qunar.com/ && ykit pack -m -q
```

其它字段按项目需求填写，如无特殊需求可不填，submit 即可。

<h2 style="font-weight: normal"> 创建 Job </h2>

Ykit 对于创建 Job 并没有特殊的要求，按正常项目需求创建即可，下图是一个 demo 项目的 job 参数：

![JOB-新建](http://ww1.sinaimg.cn/large/6af705b8gw1f8v3x6usblj20vw0hp770.jpg)

**注意：Job 创建后需要[手动添加 Job 的 devqa 权限][2]才能在 Jenkins 中 Build.**

<h2 style="font-weight: normal"> Build 项目 </h2>

<h3 style="font-weight: normal"> 【重要】Build 前检查 </h3>

1. 确保 pom.xml 里面的`artifactId`字段，已经从默认的`******`改为项目名称，并且当前分支不落后于 master。
2. 确保项目中 ykit.{type}.js 语法使用 es5，因为 Build 机器上的 node 版本为 0.12，>es5 的语法会在编译过程中报错。

<h3 style="font-weight: normal"> 关于 node_modules </h3>

1. **确保项目中不存在 node_modules，或者 node_modules 是可兼容的。** 由于 build 机器与本地的系统和 node 版本原因，有些 node_modules 包在 build 机器版本无法正常工作。因此建议使用 Ykit 的项目不要提交 node_modules，而是在 build 机器上安装（之前创建 Schema 时已经配置了安装命令）。
2. 上面的安装命令中只会安装`dependencies`，因此不要在将编译依赖的包放在`devDependencies`中。

<h3 style="font-weight: normal"> 开始 Build </h3>

在 Jenkins 刚刚创建的 Job 页面中，选择 Build with Parameters。如果是分支开发方式，需要在`tag_name`字段填写分支号，其它参数按项目需求填写即可。

[1]: http://wanshiwu.corp.qunar.com/schema/new
[2]: http://wanshiwu.corp.qunar.com/permission/job
