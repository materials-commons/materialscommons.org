import {Experiment} from '../experiments/experiment/components/tasks/experiment.model';

angular.module('materialscommons').component('mcProjectHome', {
    templateUrl: 'app/project/home/mc-project-home.html',
    controller: MCProjectHomeComponentController
});

/*@ngInject*/
function MCProjectHomeComponentController($scope, project, experimentsService, toast, $state,
                                          $stateParams, projectsService, editorOpts, $mdDialog) {
    var ctrl = this;
    ctrl.project = project.get();
    ctrl.projectLoaded = true;
    ctrl.whichExperiments = 'active';
    ctrl.experiments = [];
    let projectDescription = ctrl.project.description;

    $scope.editorOptions = editorOpts({height: 25, width: 20});

    experimentsService.getAllForProject($stateParams.project_id).then(
        (experiments) => {
            ctrl.experiments = experiments;
            for (let i = 0; i < experiments.length; i++) console.dir(experiments[i].plain());
        },
        () => toast.error('Unable to retrieve experiments for project')
    );

    ctrl.updateProjectDescription = () => {
        if (projectDescription === ctrl.project.description) {
            return;
        }

        if (ctrl.project.description === null) {
            return;
        }

        projectsService.updateProject($stateParams.project_id, {description: ctrl.project.description})
            .then(
                () => projectDescription = ctrl.project.description,
                () => toast.error('Unable to update project description')
            );
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
        this.experimentsService.createForProject(this.projectID, e)
            .then(
                (createdExperiment) => this.$mdDialog.hide(createdExperiment),
                () => this.toast.error('create experiment failed')
            );
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}
