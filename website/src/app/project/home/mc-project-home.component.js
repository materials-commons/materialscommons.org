import {Experiment} from '../experiments/experiment/components/tasks/experiment.model';

class MCProjectHomeComponentController {
    /*@ngInject*/

    constructor($scope, experimentsAPI, toast, $state, $stateParams, editorOpts, $mdDialog, mcprojstore) {
        this.experimentsAPI = experimentsAPI;
        this.toast = toast;
        this.$stateParams = $stateParams;
        this.$state = $state;
        this.$mdDialog = $mdDialog;
        this.experimentType = 'active';
        this.experiments = [];
        this.mergingExperiments = false;
        this.deletingExperiments = false;
        this.selectingExperiments = false;
        this.mcprojstore = mcprojstore;
        $scope.editorOptions = editorOpts({height: 65, width: 50});
    }

    $onInit() {
        this.unsubscribe = this.mcprojstore.subscribe(this.mcprojstore.OTPROJECT, this.mcprojstore.EVUPDATE, () => {
            this._reloadComponentState();
        });
        this._reloadComponentState();
    }

    $onDestroy() {
        this.unsubscribe();
    }

    getProjectExperiments() {
        this.experiments = _.values(this.project.experiments).map(e => {
            e.selected = false;
            return e;
        });
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

    _reloadComponentState() {
        this.project = this.mcprojstore.getProject(this.$stateParams.project_id);
        this.projectOverview = this.project.overview;
        let experimentsList = _.values(this.project.experiments);
        this.activeExperimentsCount = experimentsList.filter(e => e.status === 'active').length;
        this.onholdExperimentsCount = experimentsList.filter(e => e.status === 'on-hold').length;
        this.doneExperimentsCount = experimentsList.filter(e => e.status === 'done').length;
        this.getProjectExperiments();
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

    startExperimentsMerge() {
        this.mergingExperiments = true;
        this.selectingExperiments = true;
    }

    finishExperimentsMerge() {
        let selected = this.experiments.filter(e => e.selected);
        if (selected.length < 2) {
            return;
        }
        this.$mdDialog.show({
            templateUrl: 'app/project/home/merge-experiments-dialog.html',
            controller: MergeExperimentsDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                experiments: selected,
                projectId: this.project.id
            }
        }).then(
            () => {
                this.cancelMerge();
                this._reloadComponentState();
            },
            () => this.cancelMerge()
        );
    }

    cancelMerge() {
        this.mergingExperiments = false;
        this.experiments.forEach(e => e.selected = false);
        this.selectingExperiments = false;
    }

    startExperimentsDelete() {
        this.deletingExperiments = true;
        this.selectingExperiments = true;
    }

    finishExperimentsDelete() {
        let selected = this.experiments.filter(e => e.selected);
        if (!selected.length) {
            return;
        }

        this.$mdDialog.show({
            templateUrl: 'app/project/home/delete-experiments-dialog.html',
            controller: DeleteExperimentsDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                experiments: selected,
                projectId: this.project.id
            }
        }).then(
            () => {
                this.clearDelete();
                this._reloadComponentState();
            },
            () => {
                this.clearDelete();
            }
        );
    }

    clearDelete() {
        this.deletingExperiments = false;
        this.experiments.forEach(e => e.selected = false);
        this.selectingExperiments = false;
    }

    gotoWorkflow(e) {
        if (!this.selectingExperiments) {
            this.$state.go("project.experiment.workflow", {experiment_id: e.id});
        }
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
    constructor($mdDialog, experimentsAPI, $stateParams, toast, mcprojstore) {
        this.$mdDialog = $mdDialog;
        this.name = '';
        this.description = '';
        this.projectID = $stateParams.project_id;
        this.experimentsAPI = experimentsAPI;
        this.toast = toast;
        this.mcprojstore = mcprojstore;
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
                (createdExperiment) => {
                    this.mcprojstore.addExperiment(createdExperiment).then(
                        () => {
                            this.mcprojstore.currentExperiment = createdExperiment;
                            this.$mdDialog.hide(createdExperiment);
                        }
                    );
                },
                () => this.toast.error('create experiment failed')
            );
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class RenameProjectDialogController {
    /*@ngInject*/
    constructor($mdDialog, projectsAPI, toast, mcprojstore) {
        this.$mdDialog = $mdDialog;
        this.projectsAPI = projectsAPI;
        this.toast = toast;
        this.mcprojstore = mcprojstore;
        this.newProjectName = '';
    }

    done() {
        this.projectsAPI.updateProject(this.project.id, {name: this.newProjectName}).then(
            () => {
                this.mcprojstore.updateCurrentProject((currentProject) => {
                    currentProject.name = this.newProjectName;
                });
                this.$mdDialog.hide(this.newProjectName);
            },
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

class MergeExperimentsDialogController {
    /*@ngInject*/
    constructor($mdDialog, experimentsAPI, mcprojstore) {
        this.$mdDialog = $mdDialog;
        this.experimentsAPI = experimentsAPI;
        this.mcprojstore = mcprojstore;
        this.experimentName = '';
        this.experimentDescription = '';
    }

    done() {
        let experimentIds = this.experiments.map(e => e.id);
        this.experimentsAPI.mergeExperiments(this.projectId, experimentIds, {
            name: this.experimentName,
            description: this.experimentDescription
        }).then(
            (e) => {
                this.mcprojstore.addExperiment(e).then(
                    () => this.$mdDialog.hide(e)
                );
            },
            () => this.$mdDialog.cancel()
        );
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class DeleteExperimentsDialogController {
    /*@ngInject*/
    constructor($mdDialog, experimentsAPI, mcprojstore) {
        this.$mdDialog = $mdDialog;
        this.experimentsAPI = experimentsAPI;
        this.experimentName = '';
        this.experimentDescription = '';
        this.mcprojstore = mcprojstore;
    }

    done() {
        let experimentIds = this.experiments.map(e => e.id);
        this.experimentsAPI.deleteExperiments(this.projectId, experimentIds).then(
            () => {
                this.mcprojstore.removeExperiments(...this.experiments).then(
                    () => this.$mdDialog.hide()
                );
            },
            () => this.$mdDialog.cancel()
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
