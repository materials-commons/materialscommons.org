class MCExperimentDatasetsComponentController {
    constructor($stateParams) {
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
    }
}

angular.module('materialscommons').component('mcExperimentDatasets', {
    templateUrl: 'app/project/experiments/experiment/components/publish/mc-experiment-datasets.html',
    controller: MCExperimentDatasetsComponentController,
    bindings: {
        published: '<',
        inprocess: '<'
    }
});
