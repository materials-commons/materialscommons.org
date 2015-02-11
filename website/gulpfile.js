var gulp = require("gulp");
var usemin = require("gulp-usemin");
var ngmin = require("gulp-ngmin");
var uglify = require("gulp-uglify");
var minifyHtml = require("gulp-minify-html");
var minifyCss = require("gulp-minify-css");
var rev = require("gulp-rev");

gulp.task('partials', function() {
    var stream = gulp.src("app/**/*.html")
            .pipe(gulp.dest("prod/"));
    return stream;
});

gulp.task('default', ['partials'], function() {
    return gulp.src("./app/index.html")
        .pipe(usemin({
            css: ['concat'],
            //html: [minifyHtml({empty: true})],
            js: [ngmin(), uglify(), 'concat']
        }))
        .pipe(gulp.dest("prod/"));
});
