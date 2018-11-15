angular.module('materialscommons').component('mcProjectSamplesTable', {
    template: require('./mc-project-samples-table.html'),
    controller: MCProjectSamplesTableComponentController,
    bindings: {
        samples: '<',
        filterBy: '='
    }
});

/*@ngInject*/
function MCProjectSamplesTableComponentController($mdDialog) {
    const ctrl = this;
    ctrl.showSample = showSample;
    ctrl.sortOrder = 'experiment';

    ctrl.samplesByExperiment = {};

    for (let i = 0; i < ctrl.samples.length; i++) {
        let sample = ctrl.samples[i];
        for (let j = 0; j < sample.experiments.length; j++) {
            let experiment = sample.experiments[j];
            if (!(experiment.name in ctrl.samplesByExperiment)) {
                ctrl.samplesByExperiment[experiment.name] = [];
            }
            let s = angular.copy(sample);
            s.processes_count = s.processes.length;
            if (s.files) {
                s.files_count = s.files.length;
                delete s['files'];
            } else {
                s.files_count = 0;
            }

            delete s['processes'];
            delete s['experiments'];
            s.experiment = experiment.name;
            ctrl.samplesByExperiment[experiment.name].push(s);
        }
    }

    ctrl.allSamples = [];
    for (let key in ctrl.samplesByExperiment) {
        for (let i = 0; i < ctrl.samplesByExperiment[key].length; i++) {
            ctrl.allSamples.push(ctrl.samplesByExperiment[key][i]);
        }
    }

    function showSample(sample) {
        $mdDialog.show({
            templateUrl: 'app/modals/show-sample-dialog.html',
            controllerAs: '$ctrl',
            controller: ShowSampleDialogController,
            bindToController: true,
            multiple: true,
            locals: {
                sample: sample
            }
        });
    }
}

class ShowSampleDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.cancel();
    }
}
