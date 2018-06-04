const gulp = require('gulp');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');

gulp.task('js', () => {
    gulp.src('js/*.js')
        .pipe(babel({
            presets: [["env", {
                "targets": {
                  "browsers": ["last 2 versions"],
                  uglify: true
                }
              }]]
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
});

gulp.task('styles', () => {
    gulp.src('css/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/css'))
});

gulp.task('default', ['styles', 'js']);