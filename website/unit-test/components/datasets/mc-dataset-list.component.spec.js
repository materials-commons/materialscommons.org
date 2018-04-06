xdescribe('mc-datasets tests', () => {
    let component = '<mc-dataset-list></mc-dataset-list>',
        element, controller;

    beforeEach(() => {
        module('materialscommons');

        // mock DatasetModel
        module($provide => {
            let datasetListModel = {};
            $provide.value('DatasetListModel', datasetListModel);
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

    });

    describe('dataset list is properly fetched', () => {
        beforeEach(inject(($compile, $rootScope) => {
            let scope = $rootScope.$new();
            element = angular.element(component);
            element = $compile(element)(scope);
            console.log(element);
            scope.$digest();
            console.log(element);
            controller = element.controller('mcDatasetList');
            console.log(controller);
        }));

        it('should have a defined controller', () => {
            expect(controller).toBeDefined();
        });

    });

});