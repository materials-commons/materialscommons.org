module.exports = function(config){
    config.set({
        basePath : '../',

        files : [
            'assets/js/angular/angular.js',
            'assets/js/angular/angular-*.js',
            //'app/js/controllers/UnitControllers.js',
            'app/js/controllers/controllers.js',
            'unit-test/ControllersSpec.js'
        ],

        exclude : [

        ],

        autoWatch : true,

        frameworks: ['jasmine'],

        browsers : ['Firefox'],

        plugins : [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-script-launcher',
            'karma-jasmine'
        ]

//        junitReporter : {
//            outputFile: 'test_out/unit.xml',
//            suite: 'unit'
//        }
    });
};