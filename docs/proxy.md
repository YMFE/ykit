<h1 style="font-weight: normal"> 代理工具 </h1>

<h2 style="font-weight: normal"> 启动代理 </h2>

Ykit 使用 [Jerry Proxy][1] 作为代理插件。它结合了`SwitchHost`和`Charles/Fiddler`的功能，包括：

- 无 DNS 缓存的 Host 分组管理
- 请求 / 响应日志（抓包）
- 断点
- URL MAP
- 接口 Mock 服务
- 网速控制(Throttling)

并且支持 Qunar 通用域名的 HTTPS。通过下面命令启动代理：

```
$ sudo ykit server -x
```

此时会打开代理页面，左侧导航是项目(方案)列表，右侧面板是该分组下 Host 规则。

**对于Ykit项目，会在项目内新建/读取`ykit.host`，并且同步更新。**

![屏幕快照 2016-09-08 上午11.40.30](http://gitlab.corp.qunar.com/uploads/mfe/ykit/392730b24f/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7_2016-09-08_%E4%B8%8A%E5%8D%8811.40.30.png)

<h2 style="font-weight: normal"> 切换到代理服务 </h2>

注意此时代理还未生效，我们还需要把请求打到我们的本地代理上。简单的方式是使用`SwitchyOmega`等chrome代理插件，或者使用Proxy右上角推荐的代理插件。以下是`SwitchyOmega`的配置，我们将所有外部请求打到`127.0.0.1:999`，也就是我们的本地代理上。

![屏幕快照 2016-09-08 上午11.43.18](http://gitlab.corp.qunar.com/uploads/mfe/ykit/370cfe24b5/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7_2016-09-08_%E4%B8%8A%E5%8D%8811.43.18.png)

<h2 style="font-weight: normal"> 自定义 Url Map </h2>

切换到Url Map选项卡，可以设置请求的远程/本地映射，支持正则匹配。

![屏幕快照 2016-09-08 上午11.53.39](http://gitlab.corp.qunar.com/uploads/mfe/ykit/c1f92f0479/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7_2016-09-08_%E4%B8%8A%E5%8D%8811.53.39.png)

<h2 style="font-weight: normal"> 查看 Log </h2>

切换到请求/响应日志选项卡，可以查看通过代理请求的接口详细信息，在进行移动端调试时十分便捷。点击详情Tab的"设置断点"可以给中断请求，并可即时修改响应的body。

![屏幕快照 2016-09-08 上午11.55.40](http://gitlab.corp.qunar.com/uploads/mfe/ykit/68d3467c6c/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7_2016-09-08_%E4%B8%8A%E5%8D%8811.55.40.png)

<h2 style="font-weight: normal"> 注意事项 </h2>

- 需要抓取移动设备的请求时，请保证移动设备和电脑在同一个无线网络下，然后修改移动设备的代理配置，让IP指向自己的电脑，端口为`999`

- HTTPS请求的抓取需要安装根证书，并在网络配置面板中设置`开启HTTPS代理`

如有其它问题请联系 `jiao.shen@qunar.com`

[1]: https://github.com/Ellery0924/QProxy
