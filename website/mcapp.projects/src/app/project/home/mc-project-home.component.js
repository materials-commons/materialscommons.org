import {Experiment} from '../experiments/experiment/components/tasks/experiment.model';

angular.module('materialscommons').component('mcProjectHome', {
    templateUrl: 'app/project/home/mc-project-home.html',
    controller: MCProjectHomeComponentController
});

/*@ngInject*/
function MCProjectHomeComponentController($scope, mcstate, experimentsAPI, toast, $state,
                                          $stateParams, projectsAPI, editorOpts, $mdDialog) {
    const ctrl = this;
    ctrl.project = mcstate.get(mcstate.CURRENT$PROJECT);
    ctrl.projectLoaded = true;
    ctrl.experimentType = 'active';
    ctrl.experiments = [];
    let projectOverview = ctrl.project.overview;

    $scope.editorOptions = editorOpts({height: 65, width: 50});

    ctrl.$onInit = () => {
        experimentsAPI.getAllForProject($stateParams.project_id).then(
            (experiments) => {
                ctrl.experiments = experiments;
            },
            () => toast.error('Unable to retrieve experiments for project')
        );
    };

    ctrl.updateProjectOverview = () => {
        if (projectOverview === ctrl.project.overview) {
            return;
        }

        if (ctrl.project.overview === null) {
            return;
        }

        projectsAPI.updateProject($stateParams.project_id, {overview: ctrl.project.overview})
            .then(
                () => projectOverview = ctrl.project.overview,
                () => toast.error('Unable to update project overview')
            );
    };

    ctrl.updateProjectDescription = () => {
        projectsAPI.updateProject($stateParams.project_id, {description: ctrl.project.description}).then(
            () => null,
            () => toast.error('Unable to update project description')
        )
    };

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
        this.experimentsAPI.createForProject(this.projectID, e)
            .then(
                (createdExperiment) => this.$mdDialog.hide(createdExperiment),
                () => this.toast.error('create experiment failed')
            );
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}
