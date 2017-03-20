describe('mc-projects tests', () => {
    let element = angular.element('<mc-projects></mc-projects>');

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
            let mdDialog = {};
            mdDialog.show = jasmine.createSpy(['show']);
            mdDialog.show.and.callFake(() => {
                let p = {};
                p.then = (ok) => ok();
                return p;
            });
            $provide.value('$mdDialog', mdDialog);
        });
    });

    //it('should get all user projects when instantiated', )
});