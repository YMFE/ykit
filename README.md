## YKit


### 脚本

```javascript
let ykit = require("ykit");

ykit.pack({
    // 配置
}, (err, stats) => {

});
```

### Gulp

```javascript
let ykit = require("ykit");

gulp.task('pack', () => {
    return gulp.src('./')
        .pipe(ydoc({
            // 配置
        }));
});
```

### Grunt

```javascript
grunt.initConfig({
    ykit: {
        // 配置
    }
});

grunt.loadNpmTasks('ykit');
```
