class MCFileSamplesComponentController {
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

angular.module('materialscommons').component('mcFileSamples', {
    controller: MCFileSamplesComponentController,
    template: require('./mc-file-samples.html'),
    bindings: {
        samples: '<'
    }
});