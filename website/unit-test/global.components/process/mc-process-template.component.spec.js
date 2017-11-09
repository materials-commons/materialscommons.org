xdescribe('mc-process-template component', () => {
    let parentScope,
        element;

    beforeEach(() => {
        module('materialscommons');
    });

    describe('mc-process-template activates only one template type', () => {
        beforeEach(inject(($compile, $rootScope) => {
            parentScope = $rootScope.$new();
            parentScope.process = {
                name: 'test process',
                category: 'create_sample',
                template_name: 'Create Samples'
            };
            element = angular.element('<mc-process-template process="process"></mc-process-template>');
        }));

        it('should only activate the mc-process-template-create-samples component', ($compile) => {
            parentScope.process.template_name = 'Create Samples';
            parentScope.process.category = 'create_sample';
            $compile(element)(parentScope);
            parentScope.$digest();
            let e = findIn(element, 'mc-process-template-create-samples').text();
            expect(e).not.toEqual('');

            e = findIn(element, 'mc-process-template-sectioning').text();
            expect(e).toEqual('');

            e = findIn(element, 'mc-process-template-other').text();
            expect(e).toEqual('');
        });

        it('should only activate the mc-process-template-sectioning component', ($compile) => {
            parentScope.process.template_name = 'Sectioning';
            parentScope.process.category = 'sectioning';
            $compile(element)(parentScope);
            parentScope.$digest();
            let e = findIn(element, 'mc-process-template-sectioning').text();
            expect(e).not.toEqual('');

            e = findIn(element, 'mc-process-template-create-samples').text();
            expect(e).toEqual('');

            e = findIn(element, 'mc-process-template-other').text();
            expect(e).toEqual('');
        });

        it('should only activate the mc-process-template-other component', ($compile) => {
            parentScope.process.template_name = 'APT';
            parentScope.process.category = 'measurement';
            $compile(element)(parentScope);
            parentScope.$digest();
            let e = findIn(element, 'mc-process-template-other').text();
            expect(e).not.toEqual('');

            e = findIn(element, 'mc-process-template-create-samples').text();
            expect(e).toEqual('');

            e = findIn(element, 'mc-process-template-sectioning').text();
            expect(e).toEqual('');
        });
    });
});
