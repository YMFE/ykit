# 升级过程中可能遇到的问题

## 编译报错

### TypeError: Data must be a string or a buffer

dllPlugin 插件（hy2项目）打出的 vendor 未更新导致的。使用新版本的 ykit 执行 ykit dll，重新生成 verdor 即可。

### fetch.js:24 Uncaught TypeError: Cannot assign to read only property 'exports' of object '#<Object>'

`import` 与 `module.exports` 混用导致的问题，可以尝试单文件内只使用一种模块标准。
