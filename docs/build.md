<h1 style="font-weight: normal"> 打包 JOB </h1>

<h2 style="font-weight: normal"> 创建 Schema </h2>

1. 进入[万事屋][1]创建Schema，注意前端类型选择`非fekit编译`，其它项目信息正常填写即可。

2. 进入Schema公共详细信息填写界面，在build_command字段填写以下打包命令：

```
npm install --production --registry http://registry.npm.corp.qunar.com/ && ykit reload && ykit pack -m -q
```

其它字段按项目需求填写，如无特殊需求可不填，submit即可。

<h2 style="font-weight: normal"> 创建 Job </h2>

Ykit对于创建Job并没有特殊的要求，按正常项目需求创建即可，下图是一个demo项目的job参数：

**注意：Job创建后需要[手动添加Job的devqa权限][2]才能在Jenkins中Build.**

<h2 style="font-weight: normal"> Build 项目 </h2>

<h3 style="font-weight: normal"> Build 前检查 </h3>

确保pom.xml里面的`artifactId`字段，已经从默认的`******`改为项目名称，并且当前分支不落后于master。

<h3 style="font-weight: normal"> 关于 node_modules </h3>

1. **确保项目中不存在node_modules，或者node_modules是可兼容的。** 由于build机器与本地的系统和node版本原因，有些node_modules包在build机器版本无法正常工作。因此建议使用Ykit的项目不要提交node_modules，而是在build机器上安装（之前创建Schema时已经配置了安装命令）。
2. 上面的安装命令中只会安装dependencies，如果有编译过程中依赖了devDependencies中的包，则会报错。

<h3 style="font-weight: normal"> 开始 Build </h3>

在Jenkins刚刚创建的Job页面中，选择Build with Parameters。如果是分支开发方式，需要在tag_name字段填写分支号，其它参数按项目需求填写即可。

[1]: http://wanshiwu.corp.qunar.com/schema/new
[2]: http://wanshiwu.corp.qunar.com/permission/job
