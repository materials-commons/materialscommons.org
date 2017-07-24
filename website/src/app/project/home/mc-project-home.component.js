import {Experiment} from '../experiments/experiment/components/tasks/experiment.model';

class MCProjectHomeComponentController {
    /*@ngInject*/

    constructor($scope, mcstate, experimentsAPI, toast, $state, $stateParams, projectsAPI, editorOpts, $mdDialog) {
        this.experimentsAPI = experimentsAPI;
        this.toast = toast;
        this.$stateParams = $stateParams;
        this.$state = $state;
        this.projectsAPI = projectsAPI;
        this.$mdDialog = $mdDialog;

        this.project = mcstate.get(mcstate.CURRENT$PROJECT);
        this.projectLoaded = true;
        this.experimentType = 'active';
        this.experiments = [];
        this.projectOverview = this.project.overview;

        $scope.editorOptions = editorOpts({height: 65, width: 50});
    }

    $onInit() {
        this.experimentsAPI.getAllForProject(this.$stateParams.project_id).then(
            (experiments) => {
                this.experiments = experiments;
            },
            () => this.toast.error('Unable to retrieve experiments for project')
        );
    }

    updateProjectOverview() {
        if (this.projectOverview === this.project.overview) {
            return;
        }

        if (this.project.overview === null) {
            return;
        }

        this.projectsAPI.updateProject(this.$stateParams.project_id, {overview: this.project.overview})
            .then(
                () => this.projectOverview = this.project.overview,
                () => this.toast.error('Unable to update project overview')
            );
    }

    updateProjectDescription() {
        this.projectsAPI.updateProject(this.$stateParams.project_id, {description: this.project.description}).then(
            () => null,
            () => this.toast.error('Unable to update project description')
        );
    }

    startNewExperiment() {
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/create-experiment-dialog.html',
            controller: CreateNewExperimentDialogController,
            controllerAs: 'ctrl',
            bindToController: true
        }).then(
            (e) => {
                this.$state.go('project.experiment.details', {experiment_id: e.id});
            }
        );
    }

    renameProject() {
        this.$mdDialog.show({
            templateUrl: 'app/project/home/rename-project-dialog.html',
            controller: RenameProjectDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                project: this.project
            }
        }).then(
            (newName) => {
                this.project.name = newName;
            }
        );
    }
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

class RenameProjectDialogController {
    /*@ngInject*/
    constructor($mdDialog, projectsAPI, toast) {
        this.$mdDialog = $mdDialog;
        this.projectsAPI = projectsAPI;
        this.toast = toast;
        this.newProjectName = '';
    }

    done() {
        this.projectsAPI.updateProject(this.project.id, {name: this.newProjectName}).then(
            () => this.$mdDialog.hide(this.newProjectName),
            () => {
                this.toast.error('Failed to rename project');
                this.$mdDialog.cancel();
            }
        );
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcProjectHome', {
    templateUrl: 'app/project/home/mc-project-home.html',
    controller: MCProjectHomeComponentController
});
