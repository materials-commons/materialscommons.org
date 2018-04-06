angular.module('myComponentModule', [])
    .component('myComponent', {
        bindings: {
            myBinding: '@'
        },
        controller: function(myServiceSimple) {
            this.myGreeting = myServiceSimple()
            this.myTitle = 'Unit Testing AngularJS';
        },
        template: ' <h1>{{ $ctrl.myTitle }} {{ $ctrl.myBinding }}</h1>'
});

function myServiceFn() {
    return function() {
        return "hello";
    }
}

angular.module('myComponentModule').factory('myServiceSimple', myServiceFn);

xdescribe('Tutorial - Component: ', function () {
    beforeEach(module('myComponentModule'));

    var element;
    var scope;
    beforeEach(inject(function($rootScope, $compile){
        scope = $rootScope.$new();
        element = angular.element('<my-component my-binding="{{outside}}"></my-component>');
        element = $compile(element)(scope);
        scope.outside = '1.5';
        scope.$apply();
    }));

    it('should render the text', function() {
        var h1 = element.find('h1');
        expect(h1.text()).toBe('Unit Testing AngularJS 1.5');
    });

});

xdescribe('Tutorial - Service (no external dep): ', function () {
    beforeEach(module('myComponentModule'));

    var service;

    beforeEach(inject(function($injector){
        service = $injector.get('myServiceSimple');
    }));

    it('should exist', function() {
        expect(service).toBeDefined();
    });

    it('should return hello',function(){
        expect(service()).toBe('hello');
    });
});

xdescribe("Tutorial - Component Controller 01: ", function () {
    beforeEach(module('myComponentModule'));

    var controller;
    var element;
    var scope;

    beforeEach(inject(function($rootScope, $compile, $injector){
        scope = $rootScope.$new();
        element = angular.element('<my-component my-binding="{{outside}}"></my-component>');
        element = $compile(element)(scope);
        scope.outside = '1.5';
        scope.$apply();
    }));

    beforeEach(function() {
        controller = element.controller('myComponent');
    });

    it('should expose my title', function() {
        expect(controller.myTitle).toBeDefined();
        expect(controller.myTitle).toBe('Unit Testing AngularJS');
    });

    it('should have my binding bound', function() {
        expect(controller.myBinding).toBeDefined();
        expect(controller.myBinding).toBe('1.5');
    });

});

