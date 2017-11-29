angular.module('materialscommons').component('mcDatasetPropertyDoi', {
    template: `
        <label>DOI</label>
        <a ng-href="{{$ctrl.dataset.doi_url}}" target="_blank">{{$ctrl.dataset.doi}}</a>
    `,
    bindings: {
        dataset: '<'
    }
});