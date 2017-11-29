xdescribe('MC Component - controller for: mc-show-process', function () {
    // ref: src/app/global.components/mc-show-process.component.js

    let testingProcessId = "056fe1ed-6c1c-48b3-ba63-18d1060e585a";
    let testingProjectId = "123999";
    let testingFakeOwner = "someone@somewhere.edu";
    let now = new Date();

    let testProcess = {
        birthtime: now,
        destructive: false,
        does_transform: true,
        id: testingProcessId,
        mtime: now,
        name: "Ultrasonic Fatigue",
        otype: "process",
        owner: testingFakeOwner,
        process_type: "transform",
        template_id: "global_Ultrasonic Fatigue",
        template_name: "Ultrasonic Fatigue"
    };

    let testResults,
        controller,
        element,
        scope;

    beforeEach(() => {
        module('materialscommons');

        // mock $stateParams
        module(function ($provide) {
            $stateParams = {};
            $stateParams.project_id = testingProjectId;
            $provide.value('$stateParams', $stateParams);
        });


        // mock projectsService
        module(function ($provide) {
            let projectsAPI = {};
            let getProjectProcess = jasmine.createSpy(['getProjectProcess']);
            getProjectProcess.and.callFake(
                (projectId, processId) => {
                    testResults = testProcess;
                    testResults.id = processId;

                    // punting on promise instance!!!
                    let dummyPromise = {};
                    dummyPromise.then = (okFn) => {
                        okFn(testResults);
                    };
                    return dummyPromise;
                }
            );
            projectsAPI.getProjectProcess = getProjectProcess;
            $provide.value('projectsAPI', projectsAPI);
        });

        // mock toastr
        module(function ($provide) {
            toastr = {};

            toastr.info = jasmine.createSpy();
            toastr.warning = jasmine.createSpy();
            toastr.error = jasmine.createSpy();

            $provide.value('toastr', toastr);
        });

        inject(function ($rootScope, $compile) {
            let usage = '<mc-show-process process-id="pid"></mc-show-process>';

            // refs:
            // https://www.airpair.com/angularjs/posts/unit-testing-angularjs-applications
            // https://puigcerber.com/2016/02/07/how-to-test-angular-1-5-components/
            scope = $rootScope.$new();
            scope.pid = testingProcessId;
            element = angular.element(usage);
            element = $compile(element)(scope);
            scope.$digest();
        });
    });

    beforeEach(function () {
        controller = element.controller('mcShowProcess');
    });

    it('should be defined', function () {
        expect(controller).toBeDefined();
    });

    it('project id should be set in the controller', function () {
        expect(controller.projectId).toEqual(testingProjectId);
    });

    it('process id should be set in the controller', function () {
        expect(controller.processId).toEqual(testingProcessId);
        // above should actually be controller.processId
    });

    it('process should be set in the controller', function () {
        expect(controller.process).toBeDefined();
    });

    it('process id should be the same as testprocess', function () {
        expect(controller.process.id).toEqual(testingProcessId);
        // above should actually be controller.process.id
    });

    it(`process name should be equal to 'Ultrasonic Fatigue'`,
        () => expect(controller.process.name).toEqual('Ultrasonic Fatigue'));
});
