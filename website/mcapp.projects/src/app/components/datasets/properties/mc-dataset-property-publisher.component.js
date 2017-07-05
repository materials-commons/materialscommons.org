angular.module('materialscommons').component('mcDatasetPropertyPublisher', {
    template: `
        <label>Published By</label>
        <span>{{$ctrl.dataset.publisher}}</span>
    `,
    bindings: {
        dataset: '<'
    }
});