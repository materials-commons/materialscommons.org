var gulp = require("gulp");
var usemin = require("gulp-usemin");
var ngmin = require("gulp-ngmin");
var uglify = require("gulp-uglify");
var minifyHtml = require("gulp-minify-html");
var minifyCss = require("gulp-minify-css");
var rev = require("gulp-rev");
var clean = require("gulp-clean");
var gulpSequence = require("gulp-sequence");
var checkCSS = require('gulp-check-unused-css');

gulp.task('unused-css', function() {
    var stream = gulp.src([
        'app/assets/css/style-3.css',
        'app/**/*.html'
    ]).pipe(checkCSS());
    return stream;
});

// Default task to run. Runs the dependencies in order waiting for each to
// complete before running the others.
gulp.task('default', gulpSequence('clean', 'partials', 'other', 'select2', 'min'));

// Cleans the destination directory.
gulp.task('clean', function() {
    var stream = gulp.src("prod/").pipe(clean({read: false, force: true}));
    return stream;
});

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
        "app/assets/css/images/*",
        "app/assets/img/**/*"], {
            base: "app"
        }).pipe(gulp.dest("prod/"));
    return stream;
});

// Bring over the select2 image assets and place
// them in the path the select2 css file is
// looking for them.
gulp.task('select2', function() {
    return gulp.src([
        "app/assets/css/select2/*.png",
        "app/assets/css/select2/*.gif"
    ], {
        base: "app/assets/css/select2"
    }).pipe(gulp.dest("prod/assets/css"));
});

// Builds the new index.html, concats and minimizes
// the files.
gulp.task('min', function() {
    return gulp.src("./app/index.html")
        .pipe(usemin({
            css: [minifyCss(), 'concat'],
            html: [minifyHtml({empty: true})],
            js: [ngmin(), uglify(), 'concat']
        }))
        .pipe(gulp.dest("prod/"));
});
