import {Experiment} from './experiment/components/tasks/experiment.model';

angular.module('materialscommons').component('mcProjectExperiments', {
    templateUrl: 'app/project/experiments/mc-project-experiments.html',
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
                $state.go('project.experiment', {experiment_id: e.id});
            }
        );
    };
}

class CreateNewExperimentDialogController {
    /*@ngInject*/
    constructor($mdDialog, experimentsService, $stateParams, toast) {
        this.$mdDialog = $mdDialog;
        this.name = '';
        this.description = '';
        this.projectID = $stateParams.project_id;
        this.experimentsService = experimentsService;
        this.toast = toast;
    }

    submit() {
        if (this.name === '') {
            this.toast.error('You must supply an experiment name');
            return;
        }
        let e = new Experiment(this.name);
        e.description = this.description;
        this.experimentsService.createForProject(this.projectID, e).then(
            (createdExperiment) => {
                this.$mdDialog.hide(createdExperiment)
            },
            (error) => {
                console.log('create experiment failed', error);
            });
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}



