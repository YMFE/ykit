# hooks

Ykit 允许项目在打包过程中添加钩子。

## 配置

在 `ykit pack` 命令之前执行，可以对文件进行预处理。

```javascript
module.exports = {
    plugins: ['qunar'],
    config: {
        // ...
    }
    beforePack:  function: {
        
    }
};
```
