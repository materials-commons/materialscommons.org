xdescribe('mc-projects tests', () => {
    let component = '<mc-projects></mc-projects>',
        element, controller, demoProjectBuilderCalled = false;

    beforeEach(() => {
        module('materialscommons');

        // mock ProjectModel
        module($provide => {
            let projectModel = {};
            projectModel.getProjectsForCurrentUser = jasmine.createSpy(['getProjectsForCurrentUser']);
            projectModel.getProjectsForCurrentUser.and.callFake(() => {
                let p = {};
                p.then = (ok) => {
                    ok([{id: 'test-id', name: 'test-proj', owner: 'test@mc.org'}]);
                };
                return p;
            });
            $provide.value('ProjectModel', projectModel);
        });

        // mock $mdDialog
        module($provide => {
            let mdDialog = {};
            mdDialog.show = jasmine.createSpy(['show']);
            mdDialog.show.and.callFake(() => {
                let p = {};
                p.then = (ok) => ok();
                return p;
            });
            $provide.value('$mdDialog', mdDialog);
        });

        // mock User
        module($provide => {
            let u = {},
                mcuser = {
                    email: 'test@mc.org',
                    apikey: 'apikey-abc123'
                };
            u.attr = jasmine.createSpy(['attr']);
            u.attr.and.callFake(() => {
                return mcuser;
            });

            u.isAuthenticated = jasmine.createSpy(['isAuthenticated']);
            u.isAuthenticated.and.callFake(() => {
                return mcuser;
            });

            u.apikey = jasmine.createSpy(['apikey']);
            u.apikey.and.callFake(() => {
                return mcuser.apikey;
            });

            u.save = () => null;

            $provide.value('User', u);
        });

        module($provide => {
            let blockUI = {};
            blockUI.start = jasmine.createSpy(['start']);
            blockUI.start.and.callFake(() => null);
            blockUI.stop = jasmine.createSpy(['stop']);
            blockUI.stop.and.callFake(() => null);

            $provide.value('blockUI', blockUI);
        });

        module($provide => {
            let demoProjectService = {};
            demoProjectService.buildDemoProject = jasmine.createSpy(['buildDemoProject']);
            demoProjectService.buildDemoProject.and.callFake(() => {
                let p = {};

                p.then = (ok) => {
                    demoProjectBuilderCalled = true;
                    ok();
                };
                return p;
            });
            $provide.value('demoProjectService', demoProjectService);
        });
    });

    describe('projects are properly fetched', () => {
        beforeEach(inject(($compile, $rootScope) => {
            let scope = $rootScope.$new();
            element = angular.element(component);
            element = $compile(element)(scope);
            scope.$digest();
            controller = element.controller('mcProjects');
        }));

        it('should have a defined controller', () => {
            expect(controller).toBeDefined();
        });

        it('should get all user projects when instantiated', () => {
            expect(controller.myProjects.length).toEqual(1);
            expect(controller.joinedProjects.length).toEqual(0);
        });

        it('should reload projects when a PROJECTS$REFRESH event is generated', () => {
            // clear controller.myProjects so we see the reload happen
            controller.myProjects.length = 0;
            expect(controller.myProjects.length).toEqual(0);
            controller.mcbus.send('PROJECTS$REFRESH');
            expect(controller.myProjects.length).toEqual(1);
        });
    });

    describe('demo project building', () => {
        beforeEach(inject(($compile, $rootScope) => {
            let scope = $rootScope.$new();
            element = angular.element(component);
            element = $compile(element)(scope);
            scope.$digest();
            controller = element.controller('mcProjects');
            demoProjectBuilderCalled = false;
        }));

        it('should refresh projects after building a new demo project', () => {
            // clear controller.myProject so we can check if building a demo project reloads
            controller.myProjects.length = 0;
            controller.buildDemoProject();
            expect(demoProjectBuilderCalled).toBe(true);
            expect(controller.myProjects.length).toBe(1);
        });
    });

});