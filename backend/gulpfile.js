var gulp = require('gulp');
var babel = require('gulp-babel');
var clean = require('gulp-clean');

var mcapiServerSrc = 'servers/mcapi/**/*.js';
var mcpubServerSrc = 'servers/mcpub/**/*.js';
var libSrc = 'servers/lib/**/*.js';

gulp.task('default', ['build-servers']);

gulp.task('clean-sbin', function() {
    return gulp
        .src('sbin/')
        .pipe(clean({read: false, force: true}));
});

gulp.task('clean-lib', function() {
    return gulp.src('sbin/lib/')
        .pipe(clean({read: false, force: true}));
});

gulp.task('build-lib', ['clean-lib'], function() {
    return gulp.src([libSrc])
        .pipe(babel({presets: ['es2015'], plugins: ['transform-runtime']}))
        .pipe(gulp.dest('sbin/lib'));
});

gulp.task('clean-mcapi', function() {
    return gulp.src('sbin/mcapi/')
        .pipe(clean({read: false, force: true}));
});

gulp.task('clean-mcpub', function() {
    return gulp.src('sbin/mcpub/')
        .pipe(clean({read: false, force: true}));
});

gulp.task('build-mcapi-server', ['clean-mcapi'], function () {
    return gulp.src([mcapiServerSrc])
        .pipe(babel({presets: ['es2015'], plugins:['transform-runtime']}))
        .pipe(gulp.dest('sbin/mcapi'));
});

gulp.task('build-mcpub-server', ['clean-mcpub'], function () {
    return gulp.src([mcpubServerSrc])
        .pipe(babel({presets: ['es2015'], plugins: ['transform-runtime']}))
        .pipe(gulp.dest('sbin/mcpub'));
});

gulp.task('build-mcapi-server-lib', ['build-lib', 'build-mcapi-server']);

gulp.task('build-mcpub-server-lib', ['build-lib', 'build-mcpub-server']);

gulp.task('build-servers', ['build-lib', 'build-mcapi-server', 'build-mcpub-server']);
