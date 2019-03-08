import { Experiment } from '../../models/experiment.model';

class MCProjectHomeComponentController {
    /*@ngInject*/
    constructor(User, $scope, toast, $state,
                editorOpts, $mdDialog,
                mcprojstore, projectsAPI, mcStateStore) {
        this.toast = toast;
        this.$state = $state;
        this.$mdDialog = $mdDialog;
        this.experimentType = 'active';
        this.mergingExperiments = false;
        this.deletingExperiments = false;
        this.selectingExperiments = false;
        this.sortOrder = 'name';
        this.mcprojstore = mcprojstore;
        this.projectsAPI = projectsAPI;
        this.mcStateStore = mcStateStore;
        this.etlStatusAvailable = false;
        this.etlInProgress = false;
        this.etlStatusRecordId = null;
        this.project = null;
        this.excelFileList = [];
        if (User.isAuthenticated()) {
            this.user = User.attr().fullname;
            this.isAdmin = User.attr().admin;
            this.isBetaUser = User.attr().beta_user;
        }
        $scope.editorOptions = editorOpts({height: 65, width: 50});
    }

    $onInit() {
        this._reloadComponentState();
        this.unsubscribeProject = this.mcStateStore.subscribe('project', () => this._reloadComponentState());
    }

    $onDestroy() {
        this.unsubscribeProject();
    }

    startNewExperiment() {
        this.$mdDialog.show({
            templateUrl: 'app/modals/create-experiment-dialog.html',
            controller: CreateNewExperimentDialogController,
            controllerAs: 'ctrl',
            bindToController: true,
            clickOutsideToClose: true,
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
        let selected = this.project.experiments.filter(e => e.selected);
        if (selected.length < 2) {
            return;
        }
        this.$mdDialog.show({
            templateUrl: 'app/modals/merge-experiments-dialog.html',
            controller: MergeExperimentsDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
            locals: {
                experiments: selected,
                projectId: this.project.id
            }
        }).then(
            () => {
                this.cancelMerge();
            },
            () => this.cancelMerge()
        );
    }

    cancelMerge() {
        this.mergingExperiments = false;
        this.project.experiments.forEach(e => e.selected = false);
        this.selectingExperiments = false;
        this._reloadComponentState();
    }

    startExperimentsDelete() {
        this.deletingExperiments = true;
        this.selectingExperiments = true;
    }

    finishExperimentsDelete() {
        let selected = this.project.experiments.filter(e => e.selected);
        if (!selected.length) {
            return;
        }

        this.$mdDialog.show({
            templateUrl: 'app/modals/delete-experiments-dialog.html',
            controller: DeleteExperimentsDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
            locals: {
                experiments: selected,
                project: this.project
            }
        }).then(
            () => {
                this.clearDelete();
            },
            () => {
                this.clearDelete();
            }
        );
    }

    clearDelete() {
        this.deletingExperiments = false;
        this.project.experiments.forEach(e => e.selected = false);
        this.selectingExperiments = false;
        this._reloadComponentState();
    }

    gotoWorkflow(e) {
        if (!this.selectingExperiments) {
            this.$state.go('project.experiment.workflow', {experiment_id: e.id});
        }
    }

    etlStart() {
        this.excelFileList = [];
        this.projectsAPI.getExcelFilePaths(this.project.id).then(
            (results) => {
                this.excelFileList = results.file_list;
            },
            () => {
                this.excelFileList = [];
            }
        ).then(() => {
                this.$mdDialog.show({
                    templateUrl: 'app/modals/mc-etl-upload-dialog.html',
                    controller: EtlDialogController,
                    controllerAs: '$ctrl',
                    bindToController: true,
                    clickOutsideToClose: true,
                    locals: {
                        project: this.project,
                        excel_files: this.excelFileList
                    }
                }).then(
                    () => {
                        this.mcStateStore.fire('sync:project');
                    },
                    () => {}
                );
            }
        );
    }

    _reloadComponentState() {
        this.project = this.mcStateStore.getState('project');
        let experimentsList = _.values(this.project.experiments);
        this.activeExperimentsCount = experimentsList.filter(e => e.status === 'active').length;
        this.onholdExperimentsCount = experimentsList.filter(e => e.status === 'on-hold').length;
        this.doneExperimentsCount = experimentsList.filter(e => e.status === 'done').length;
    }
}

class CreateNewExperimentDialogController {
    /*@ngInject*/
    constructor($mdDialog, experimentsAPI, $stateParams, toast, mcprojstore, mcStateStore) {
        this.$mdDialog = $mdDialog;
        this.name = '';
        this.description = '';
        this.projectID = $stateParams.project_id;
        this.experimentsAPI = experimentsAPI;
        this.toast = toast;
        this.mcprojstore = mcprojstore;
        this.mcStateStore = mcStateStore;
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
                    this.mcStateStore.fire('sync:project');
                    this.$mdDialog.hide(createdExperiment);
                },
                () => this.toast.error('create experiment failed')
            );
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class MergeExperimentsDialogController {
    /*@ngInject*/
    constructor($mdDialog, experimentsAPI, mcprojstore, mcStateStore) {
        this.$mdDialog = $mdDialog;
        this.experimentsAPI = experimentsAPI;
        this.mcprojstore = mcprojstore;
        this.mcStateStore = mcStateStore;
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
                this.mcStateStore.fire('sync:project');
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
    constructor($mdDialog, experimentsAPI, mcprojstore, toast, User, mcStateStore) {
        this.$mdDialog = $mdDialog;
        this.experimentsAPI = experimentsAPI;
        this.experimentName = '';
        this.experimentDescription = '';
        this.mcprojstore = mcprojstore;
        this.toast = toast;
        this.user = User.u();
        this.mcStateStore = mcStateStore;
    }

    done() {
        if (this.canDeleteExperiments()) {
            let experimentIds = this.experiments.map(e => e.id);
            this.experimentsAPI.deleteExperiments(this.project.id, experimentIds).then(
                () => {
                    this.mcStateStore.fire('sync:project');
                    this.mcprojstore.removeExperiments(...this.experiments).then(
                        () => this.$mdDialog.hide()
                    );
                },
                () => this.$mdDialog.cancel()
            );
        } else {
            this.toast.error('You are attempting to delete experiments when you are not the experiment or project owner');
        }
    }

    canDeleteExperiments() {
        let canDelete = true;
        this.experiments.forEach(e => {
            if (!this.canDelete(e.owner, this.project.owner, this.user)) {
                canDelete = false;
            }
        });

        return canDelete;
    }

    canDelete(experimentOwner, projectOwner, user) {
        if (experimentOwner === user) {
            return true;
        } else if (projectOwner === user) {
            return true;
        }

        return false;
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class EtlDialogController {
    /*@ngInject*/
    constructor($mdDialog, Upload, experimentsAPI, toast, User) {
        this.$mdDialog = $mdDialog;
        this.Upload = Upload;
        this.experimentsAPI = experimentsAPI;
        this.toast = toast;
        this.User = User;
        this.user_id = User.u();
        this.name = '';
        this.description = '';
        this.files = []; // for direct upload
        this.excelFile = null; // for Project upload
    }

    project_upload_ok() {
        return this.name && (this.excelFile);
    }

    etlInProject() {
        this.experimentsAPI.createExperimentFromSpreadsheet(this.name, this.excelFile.id, this.project.id).then(
            () => this.$mdDialog.hide(),
            () => this.$mdDialog.cancel()
        );
    }

    uploadDirect() {
        return this.Upload.upload({
            url: `api/v3/uploadFileToProjectDirectory`,
            data: {
                file: this.files[0],
                project_id: this.project.id,
                directory_id: this.project.root_dir.id,
                apikey: this.User.apikey(),
            }
        }).then(
            (result) => {
                this.experimentsAPI.createExperimentFromSpreadsheet(this.name, result.data.data.id, this.project.id).then(
                    () => this.$mdDialog.hide(),
                    () => this.$mdDialog.cancel()
                );
            },
            (e) => {
                console.log('error = ', e);
                if (e.status === 502) {
                    this.toast.error('Excel file upload; Service not available. Contact Admin.');
                } else if (e.status > 200) {
                    this.toast.error('Excel file upload; Service not available. Code - ' + e.status + '. Contact Admin.');
                }
                this.$mdDialog.cancel(e);
            }
        );
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcProjectHome', {
    template: require('./mc-project-home.html'),
    controller: MCProjectHomeComponentController,
});
