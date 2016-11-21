const gulp = require('gulp');
const babel = require('gulp-babel');
const watch = require('gulp-watch');

gulp.task('default', ['compileJS', 'moveConfig']);

gulp.task('compileJS', [], function() {
	var babelProcess = babel({presets: ['es2015']})
    babelProcess.on('error', function(e) {
        console.log(e);
        process.exit(1);
    });

    return watch('src/**/*.js', {
        verbose: true,
        ignoreInitial: true
    }).pipe(babelProcess).pipe(gulp.dest('lib'));
})

gulp.task('moveConfig', [], function() {
    return watch('src/config/**/*.*', {
        verbose: true,
        ignoreInitial: true
    }, () => {
        gulp.src('src/config/**/*.*', {base: 'src/'}).pipe(gulp.dest('lib'));
    })
});
