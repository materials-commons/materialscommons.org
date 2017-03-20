class MCExperimentOverviewDetailsComponentController {
    /*@ngInject*/
    constructor() {

    }

    $onInit() {
        this.measuredSamples = this.experiment.samples.filter(s => s.process_count > 1);
        this.publishedDatasets = this.experiment.datasets.filter(ds => ds.published);
        this.completedTasks = this.experiment.tasks.filter(t => t.flags.done);
    }

    pubPlural() {
        return this.experiment.publications.length === 1 ? "Publication" : "Publications";
    }

    samplePlural() {
        return this.experiment.samples.length === 1 ? "Sample" : "Samples";
    }

    processPlural() {
        return this.experiment.processes.length === 1 ? "Process" : "Processes";
    }

    datasetPlural() {
        return this.experiment.datasets.length === 1 ? "Dataset" : "Datasets";
    }

    filePlural() {
        return this.experiment.files.length === 1 ? "File" : "Files";
    }

    notePlural() {
        return this.experiment.notes.length === 1 ? "Note" : "Notes";
    }
}

angular.module('materialscommons').component('mcExperimentOverviewDetails', {
    templateUrl: 'app/project/home/mc-experiment-overview-details.html',
    controller: MCExperimentOverviewDetailsComponentController,
    bindings: {
        experiment: '<'
    }
});
