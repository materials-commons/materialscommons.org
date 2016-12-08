describe('Component: mc-show-process', function(){
    // ref: src/app/global.components/mc-show-process.component.js

    var controller;
    var element;
    var scope;

    var usage = '<mc-show-process processId="{{process_id}}"></mc-show-process>';

    beforeEach(module('materialscommons'));

    beforeEach(inject(function($rootScope, $compile){
        scope = $rootScope.$new();
        element = angular.element(usage);
        element = $compile(element)(scope);
        scope.process_id = '12345';
        scope.$apply();
    }));

    beforeEach(function() {
        controller = element.controller('mcShowProcess');
    });

     // Verify our controller exists
     it('should be defined', function() {
         expect(controller).toBeDefined();
     });
 });
