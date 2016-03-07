var gulp = require('gulp');
var babel = require('gulp-babel');
var clean = require('gulp-clean');

gulp.task('default', ['build-server']);

gulp.task('clean-sbin', function() {
    return gulp
        .src('sbin/')
        .pipe(clean({read: false, force: true}));
});

var serverSrc = 'server/**/*.js';
gulp.task('build-server', ['clean-sbin'], function() {
    return gulp
        .src(serverSrc)
        .pipe(babel({presets: ['es2015'], plugins:['transform-runtime']}))
        .pipe(gulp.dest('sbin'));
});

gulp.task('server-watch', ['build-server'], function() {
    gulp.watch([serverSrc], ['build-server']);
});
