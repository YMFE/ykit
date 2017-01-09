<h1 style="font-weight: normal"> 发布 </h1>

<h2 style="font-weight: normal"> 创建/编辑 Schema </h2>

进入[万事屋][1]创建/编辑 Schema，注意前端类型选择`非 fekit 编译`，其它按项目实际情况填写。

<img src="http://ww3.sinaimg.cn/large/6af705b8gw1f8v3wuuz2dj20o50dnmzn.jpg" width="650px;">

<h2 style="font-weight: normal"> 设置 build 参数</h2>

点击进入编辑界面，首先设置 build_method ，`sfile` 代表普通编译模式，`node` 代表使用 node 模块缓存策略，安装更快，但是需要项目中存在 npm-shrinkwrap（详见 [shrinkwrap 使用][3]）。

<img src="http://oji8kngu4.bkt.clouddn.com/build_params.jpeg" width="650px;">

**注意：build_method 更改以后需要更新 job 才会生效（进入万事屋 [job 编辑菜单][5]，点击保存即可）。**

`beta` 和 `prod` 标签下的 build_command 都设置为：

```
export PATH=/usr/local/n/versions/node/6.2.1/bin:$PATH && npm install --registry http://registry.npm.corp.qunar.com/ && ykit pack -m -q
```

后续字段按项目实际情况填写，如无特殊需求可不进行更改，submit 即可。

<h2 style="font-weight: normal"> 创建/编辑 Job </h2>

在万事屋的[Job 菜单][4]中新建/编辑 Job。Ykit 对于 Job 并没有特殊的要求，按项目实际情况填写。

<h2 style="font-weight: normal"> Build 项目 </h2>

<h3 style="font-weight: normal"> 添加 Job 的 devqa 权限 </h3>

首先，Job 创建后需要[手动添加 Job 的执行权限][2]才能在 Jenkins 中 Build，否则在 qdr 等平台无法执行 build 操作。

<h3 style="font-weight: normal"> Build 前检查 </h3>

- 确保 pom.xml 里面的`artifactId`字段，已经从默认的`******`改为项目名称，并且当前分支不落后于 master。

- **确保项目中不存在 node_modules，或者 node_modules 是可兼容的。** 由于 build 机器与本地的系统和 node 版本原因，有些 node_modules 包在 build 机器版本无法正常工作。因此建议使用 Ykit 的项目不要提交 node_modules，在 build 机器上安装即可（之前创建 Schema 时 `ykit build` 中已经包含了安装命令）。

<h3 style="font-weight: normal"> 开始 Build </h3>

在 Jenkins 刚刚创建的 Job 页面中，选择 Build with Parameters。如果是分支开发方式，需要在`tag_name`字段填写分支号，其它参数按项目需求填写即可。

[1]: http://wanshiwu.corp.qunar.com/schema/new
[2]: http://wanshiwu.corp.qunar.com/permission/job
[3]: ./docs-npm%20shrinkwrap.html
[4]: http://wanshiwu.corp.qunar.com/job/search/new
[5]: http://wanshiwu.corp.qunar.com/job/search/edit
