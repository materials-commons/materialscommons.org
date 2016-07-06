class MCDatasetSamplesComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcDatasetSamples', {
    templateUrl: 'app/project/experiments/experiment/components/dataset/components/mc-dataset-samples.html',
    controller: MCDatasetSamplesComponentController,
    bindings: {
        samples: '<'
    }
});
