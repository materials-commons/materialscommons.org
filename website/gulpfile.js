/**
 *  Welcome to your gulpfile!
 *  The gulp tasks are splitted in several files in the gulp directory
 *  because putting all here was really too long
 */

'use strict';

var gulp = require('gulp');
const readdirSync = require('klaw-sync');


/**
 *  This will load all js or coffee files in the gulp directory
 *  in order to load all gulp tasks
 */
readdirSync('./gulp', {nodir: true}).map(e => e.path).filter(function (file) {
    return (/\.(js|coffee)$/i).test(file);
}).map(function (file) {
    require(file);
});


/**
 *  Default task clean temporaries directories and launch the
 *  main optimization build task
 */
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});
