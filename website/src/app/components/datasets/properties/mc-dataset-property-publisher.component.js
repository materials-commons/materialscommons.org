angular.module('materialscommons').component('mcDatasetPropertyPublisher', {
    template: `
        <label>Published By</label>
        <span>{{$ctrl.dataset.publisher.fullname}} ({{$ctrl.dataset.publisher.email}})</span>
    `,
    bindings: {
        dataset: '<'
    }
});