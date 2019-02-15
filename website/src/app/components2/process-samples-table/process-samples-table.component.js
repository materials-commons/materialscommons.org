class MCProcessSamplesTableComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            samples: [],
        };
    }

    $onChanges(changes) {
        if (changes.samples) {
            this.state.samples = angular.copy(changes.samples.currentValue);
        }
    }
}

angular.module('materialscommons').component('mcProcessSamplesTable', {
    controller: MCProcessSamplesTableComponentController,
    template: require('./process-samples-table.html'),
    bindings: {
        samples: '<'
    }
});