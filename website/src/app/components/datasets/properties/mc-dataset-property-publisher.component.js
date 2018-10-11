angular.module('materialscommons').component('mcDatasetPropertyPublisher', {
    template: `
        <label>Dataset Owner</label>
        <span>{{$ctrl.dataset.publisher.fullname}} ({{$ctrl.dataset.publisher.id}})</span>
    `,
    bindings: {
        dataset: '<'
    }
});