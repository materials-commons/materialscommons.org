describe('mc-projects tests', () => {
    beforeEach(() => {
        module('materialscommons');

        // mock ProjectModel
        module($provide => {
            let projectModel = {};
            projectModel.getProjectsForCurrentUser = jasmine.createSpy(['getProjectsForCurrentUser']);
            projectModel.getProjectsForCurrentUser.and.callFake(() => {
                let p = {};
                p.then = (ok) => {
                    ok([]);
                };
                return p;
            });
            $provide.value('ProjectModel', projectModel);
        });

        // mock $mdDialog
        module($provide => {

        });
    });

});