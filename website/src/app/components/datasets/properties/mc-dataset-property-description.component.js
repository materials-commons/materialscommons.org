angular.module('materialscommons').component('mcDatasetPropertyDescription', {
    template: `
        <label>Description</label>
        <i ng-if="!$ctrl.dataset.description">No Description given</i>
        <p ng-if="$ctrl.dataset.description" class="margin-left-15">{{$ctrl.dataset.description}}</p>
    `,
    bindings: {
        dataset: '<'
    }
});

