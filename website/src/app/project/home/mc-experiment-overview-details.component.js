class MCExperimentOverviewDetailsComponentController {
    /*@ngInject*/
    constructor() {

    }

    $onInit() {
        this.usedSamples = _.values(this.experiment.samples).filter(s => s.process_count > 1);
        this.publishedDatasets = this.experiment.datasets.filter(ds => ds.published);
        this.completedTasks = this.experiment.tasks.filter(t => t.flags.done);
    }

    pubPlural() {
        return this.experiment.publications.length === 1 ? 'Publication' : 'Publications';
    }

    samplePlural() {
        return this.experiment.samples.length === 1 ? 'Sample' : 'Samples';
    }

    usedSamplesPlural() {
        switch (this.usedSamples.length) {
            case 0:
                return 'Used';
            case 1:
                return 'Sample Used';
            default:
                return 'Samples Used';
        }
    }

    publishedDatasetsPlural() {
        switch (this.publishedDatasets.length) {
            case 0:
                return 'Published';
            case 1:
                return 'Dataset Published';
            default:
                return 'Datasets Published';
        }
    }

    processPlural() {
        return this.experiment.processes.length === 1 ? 'Process' : 'Processes';
    }

    datasetPlural() {
        return this.experiment.datasets.length === 1 ? 'Dataset' : 'Datasets';
    }

    filePlural() {
        return this.experiment.files_count === 1 ? 'File' : 'Files';
    }

    notePlural() {
        return this.experiment.notes.length === 1 ? 'Note' : 'Notes';
    }
}

angular.module('materialscommons').component('mcExperimentOverviewDetails', {
    templateUrl: 'app/project/home/mc-experiment-overview-details.html',
    controller: MCExperimentOverviewDetailsComponentController,
    bindings: {
        experiment: '<'
    }
});
