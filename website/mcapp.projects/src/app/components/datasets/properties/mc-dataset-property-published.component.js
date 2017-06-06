angular.module('materialscommons').component('mcDatasetPropertyPublished', {
    template: `
        <label>Published</label>
        <span>{{$ctrl.dataset.birthtime | date:'longDate'}}</span>
    `,
    bindings: {
        dataset: '<'
    }
});