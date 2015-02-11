var gulp = require("gulp");
var usemin = require("gulp-usemin");
var ngmin = require("gulp-ngmin");
var uglify = require("gulp-uglify");
var minifyHtml = require("gulp-minify-html");
var minifyCss = require("gulp-minify-css");
var rev = require("gulp-rev");
var clean = require("gulp-clean");
var gulpSequence = require("gulp-sequence");

// Brings over the angular html partials.
gulp.task('partials', function() {
    var stream = gulp.src("app/**/*.html")
            .pipe(gulp.dest("prod/"));
    return stream;
});

// Brings over other assets such as fonts and images,
// and the application style sheet.
gulp.task('other', function() {
    var stream = gulp.src([
        "app/assets/fonts/**/*",
        "app/assets/ico/**/*",
        "app/assets/css/select2/*",
        "app/assets/css/images/*",
        "app/assets/img/**/*",
        "app/style-3.css"], {
            base: "app"
        }).pipe(gulp.dest("prod/"));
    return stream;
});

// Cleans the destination directory.
gulp.task('clean', function() {
    var stream = gulp.src("prod/").pipe(clean({read: false, force: true}));
    return stream;
});

// Builds the new index.html, concats and minimizes
// the files.
gulp.task('min', function() {
    return gulp.src("./app/index.html")
        .pipe(usemin({
            css: ['concat'],
            //html: [minifyHtml({empty: true})],
            js: [ngmin(), uglify(), 'concat']
        }))
        .pipe(gulp.dest("prod/"));
});

gulp.task('default', gulpSequence('clean', 'partials', 'other', 'min'));
