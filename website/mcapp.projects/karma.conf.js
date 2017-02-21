'use strict';

var path = require('path');
var conf = require('./gulp/conf');

var _ = require('lodash');
var wiredep = require('wiredep');

var pathSrcHtml = [
    path.join(conf.paths.src, '/**/*.html')
];

function listFiles() {
    var wiredepOptions = _.extend({}, conf.wiredep, {
        dependencies: true,
        devDependencies: true
    });

    var patterns = wiredep(wiredepOptions).js
        .concat([
            path.join(conf.paths.tmp, 'serve/app/index.module.js')
        ])
        .concat(pathSrcHtml);

    var files = patterns.map(function (pattern) {
        return {
            pattern: pattern
        };
    });

//    files.push('../../node_modules/angular/angular.js');              // angular
    files.push('../../node_modules/angular-mocks/angular-mocks.js');  // to load modules for tests

    // external modules
    files.push({
        pattern: path.join(conf.paths.src, '/app/external/js/ckeditor/ckeditor.js'),
        included: true,
        served: true,
        watched: false
    });

    files.push({
        pattern: path.join(conf.paths.src, '/app/external/js/angular-filter.js'),
        included: true,
        served: true,
        watched: false
    });

    files.push({
        pattern: path.join(conf.paths.src, '/app/external/js/flow.js'),
        included: true,
        served: true,
        watched: false
    });

    files.push({
        pattern: path.join(conf.paths.src, '/app/external/js/highlight.pack.js'),
        included: true,
        served: true,
        watched: false
    });

    files.push({
        pattern: path.join(conf.paths.src, '/app/external/js/lodash.min.js'),
        included: true,
        served: true,
        watched: false
    });

    files.push({
        pattern: path.join(conf.paths.src, '/app/external/js/TreeModel-min.js'),
        included: true,
        served: true,
        watched: false
    });

    // source code
    files.push({
        pattern: path.join(conf.paths.src, '/app/**/*.js'),
        included: false,
        served: false,
        watched: true
    });

    // assets
    files.push({
        pattern: path.join(conf.paths.src, '/assets/**/*'),
        included: false,
        served: true,
        watched: false
    });

    // unit-tests
    files.push({
        pattern: 'unit-test/**/*.spec.js',
        include: true,
        watched: true
    });

    // helper functions
    files.push({
        pattern: 'unit-test/testutils/*.js',
        include: true,
        watched: true
    });

    return files;
}

module.exports = function (config) {

    var configuration = {
        files: listFiles(),

        singleRun: false,

        autoWatch: true,

        autoWatchBatchDelay: 500,

        failOnEmptyTestSuite: false,

        ngHtml2JsPreprocessor: {
            stripPrefix: conf.paths.src + '/',
            moduleName: 'materialscommons'
        },

        logLevel: 'WARN',

        frameworks: ['jasmine'],

        // browsers : ['PhantomJS','Chrome'],
        browsers : ['Chrome'],

        plugins: [
            'karma-phantomjs-launcher',
            'karma-chrome-launcher',
            'karma-coverage',
            'karma-jasmine',
            'karma-ng-html2js-preprocessor',
            'karma-mocha-reporter'
        ],

        coverageReporter: {
            type: 'html',
            dir: 'coverage/'
        },

        // reporters: ['progress','mocha'],
        reporters: ['mocha'],

        proxies: {
            '/assets/': path.join('/base/', conf.paths.src, '/assets/')
        }
    };

    // This is the default preprocessors configuration for a usage with Karma cli
    // The coverage preprocessor is added in gulp/unit-test.js only for single tests
    // It was not possible to do it there because karma doesn't let us now if we are
    // running a single test or not
    configuration.preprocessors = {};
    pathSrcHtml.forEach(function (path) {
        configuration.preprocessors[path] = ['ng-html2js'];
    });

    // This block is needed to execute Chrome on Travis
    // If you ever plan to use Chrome and Travis, you can keep it
    // If not, you can safely remove it
    // https://github.com/karma-runner/karma/issues/1144#issuecomment-53633076
    if (configuration.browsers[0] === 'Chrome' && process.env.TRAVIS) {
        configuration.customLaunchers = {
            'chrome-travis-ci': {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        };
        configuration.browsers = ['chrome-travis-ci'];
    }

    config.set(configuration);
};
