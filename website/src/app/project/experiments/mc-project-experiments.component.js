import {Experiment} from './experiment/components/tasks/experiment.model';

angular.module('materialscommons').component('mcProjectExperiments', {
    template: require('./mc-project-experiments.html'),
    controller: MCProjectExperimentsComponentController,
    bindings: {
        experiments: '='
    }
});

/*@ngInject*/
function MCProjectExperimentsComponentController($mdDialog, $state) {
    let ctrl = this;
    ctrl.showTableView = true;
    ctrl.startNewExperiment = () => {
        $mdDialog.show({
            templateUrl: 'app/project/experiments/create-experiment-dialog.html',
            controller: CreateNewExperimentDialogController,
            controllerAs: 'ctrl',
            bindToController: true
        }).then(
            (e) => {
                $state.go('project.experiment.details', {experiment_id: e.id});
            }
        );
    };
}

class CreateNewExperimentDialogController {
    /*@ngInject*/
    constructor($mdDialog, experimentsAPI, $stateParams, toast) {
        this.$mdDialog = $mdDialog;
        this.name = '';
        this.description = '';
        this.projectID = $stateParams.project_id;
        this.experimentsAPI = experimentsAPI;
        this.toast = toast;
    }

    submit() {
        if (this.name === '') {
            this.toast.error('You must supply an experiment name');
            return;
        }
        let e = new Experiment(this.name);
        e.description = this.description;
        this.experimentsAPI.createForProject(this.projectID, e).then(
            (createdExperiment) => {
                this.$mdDialog.hide(createdExperiment)
            },
            () => {
                this.toast.error('Create experiment failed');
            });
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}
