angular.module('materialscommons').component('mcDatasetPropertyFunding', {
    template: `
        <label>Funding</label>
        <span>{{$ctrl.dataset.funding}}</span>
    `,
    bindings: {
        dataset: '<'
    }
});