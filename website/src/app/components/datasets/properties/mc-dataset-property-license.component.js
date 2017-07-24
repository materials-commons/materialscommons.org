angular.module('materialscommons').component('mcDatasetPropertyLicense', {
    template: `
        <label>License</label>
        <span ng-if="$ctrl.dataset.license.name === ''">No license</span>
        <a ng-if="$ctrl.dataset.license.name !== ''" ng-href="{{$ctrl.dataset.license.link}}" target="_blank">{{$ctrl.dataset.license.name}}</a>
    `,
    bindings: {
        dataset: '<'
    }
});