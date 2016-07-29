const gulp = require('gulp');
const babel = require('gulp-babel');
const watch = require('gulp-watch');

gulp.task('default', ['compileJS', 'moveConfig']);

gulp.task('compileJS', [], function() {
	return watch('src/**/*.js', { verbose: true, ignoreInitial: false })
        .pipe(babel({presets: ['es2015']}))
		.pipe(gulp.dest('lib'));
})

gulp.task('moveConfig', [], function() {
    return watch('src/config/**/*.*', { verbose: true, ignoreInitial: false }, () => {
        gulp.src('src/config/**/*.*', {base: 'src/'})
            .pipe(gulp.dest('lib'));
    })
});
