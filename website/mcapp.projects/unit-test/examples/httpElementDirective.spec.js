// source: Simple HTML Element Directive in https://docs.angularjs.org/guide/unit-testing

// create app; no dependencies
var app = angular.module('myApp', []);

// example directive
app.directive('aGreatEye', function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<h1>lidless, wreathed in flame, {{1 + 1}} times</h1>'
    };
});

// tests

describe('Unit testing great quotes', function() {
    var $compile,
        $rootScope;

    // Load the myApp module, which contains the directive
    beforeEach(module('myApp'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function(_$compile_, _$rootScope_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('Replaces the element with the appropriate content', function() {
        // Compile a piece of HTML containing the directive
        var element = $compile("<a-great-eye></a-great-eye>")($rootScope);
        // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
        $rootScope.$digest();
        // Check that the compiled element contains the templated content
        expect(element.html()).toContain("lidless, wreathed in flame, 2 times");
    });

});