describe('mc-processes-workflow-outline component', () => {
    let parentScope, element;

    beforeEach(() => {
        module('materialscommons');
    });

    describe('mc-process-workflow-outline button activation', () => {
        beforeEach(inject(($compile, $rootScope) => {
            parentScope = $rootScope.$new();
        }));

        it('should have a place holder for the delete button test', () => {
            expect(true).toBe(true);
        });
    });
});