describe('MC Component: mc-show-process', function(){
    // ref: src/app/global.components/mc-show-process.component.js

    let testingProcessId = "123000";
    let testingProjectId = "123999";

    var controller;
    var element;
    var scope;

    var usage = '<mc-show-process processId="{{process_id}}"></mc-show-process>';

    beforeEach(function() {
        module('materialscommons');

        // moke $stateParams
        module(function ($provide) {
            $stateParams = {};
            $stateParams.project_id = testingProjectId;
            $provide.value('$stateParams', $stateParams);
        });


        // mock projectsService
        module(function ($provide) {
            projectsService = {};
            $provide.value('projectsService', toprojectsServiceastr);
        });

        // mock toastr
        module(function ($provide) {
            toastr = {};

            toastr.info = jasmine.createSpy();
            toastr.warning = jasmine.createSpy();
            toastr.error = jasmine.createSpy();

            $provide.value('toastr', toastr);
        });
    });

    beforeEach(inject(function($rootScope, $compile){
        scope = $rootScope.$new();
        element = angular.element(usage);
        element = $compile(element)(scope);
        scope.process_id = testingProcessId;
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
