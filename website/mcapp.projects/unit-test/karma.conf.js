module.exports=function(config){
    config.set({
        basePath: '..',
        frameworks: ['jasmine'],
        files: [
        'bower_components/angular/angular.js',
        'bower_components/angular/angular-route.js',
        'unit-test/lib/angular-mocks.js',
        'unit-test/**/*-test.js'
        ],
        exclude: [],
        port: 9876,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false
    });
};

