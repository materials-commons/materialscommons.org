class MCExperimentOverviewDetailsComponentController {
    /*@ngInject*/
    constructor() {

    }

    $onInit() {
        this.measuredSamples = this.experiment.samples.filter(s => s.process_count > 1);
        this.publishedDatasets = this.experiment.datasets.filter(ds => ds.published);
        this.completedTasks = this.experiment.tasks.filter(t => t.flags.done);
    }
}

angular.module('materialscommons').component('mcExperimentOverviewDetails', {
    templateUrl: 'app/project/home/mc-experiment-overview-details.html',
    controller: MCExperimentOverviewDetailsComponentController,
    bindings: {
        experiment: '<'
    }
});
