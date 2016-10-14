<h1 style="font-weight: normal"> Node.js API </h1>

<h2 style="font-weight: normal"> 调用 Ykit 打包方法 </h2>

```javascript
let ykit = require("ykit");

ykit.pack({
    // 配置
}, (err, stats) => {

});
```

<h2 style="font-weight: normal"> 与 Gulp 结合使用 </h2>

```javascript
let ykit = require("ykit");

gulp.task('pack', () => {
    return gulp.src('./')
        .pipe(ykit({
            // 配置
        }));
});
```

<h2 style="font-weight: normal"> 与 Grunt 结合使用 </h2>

```javascript
grunt.initConfig({
    ykit: {
        // 配置
    }
});

grunt.loadNpmTasks('ykit');
```
