```javascript
let ykit = require("ykit");

ykit.pack({
    // 配置
}, (err, stats) => {

});
```

### 与Gulp结合使用

```javascript
let ykit = require("ykit");

gulp.task('pack', () => {
    return gulp.src('./')
        .pipe(ykit({
            // 配置
        }));
});
```

### 与Grunt结合使用

```javascript
grunt.initConfig({
    ykit: {
        // 配置
    }
});

grunt.loadNpmTasks('ykit');
```
