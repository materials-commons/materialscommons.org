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
        let selected = this.project.experiments.filter(e => e.selected);
        if (selected.length < 2) {
            return;
        }
        this.$mdDialog.show({
            templateUrl: 'app/modals/merge-experiments-dialog.html',
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

    etlReportImmediateComplete(status) {
        this.$mdDialog.show({
            templateUrl: 'app/modals/mc-etl-message-dialog.html',
            controller: EtlMessageDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                status: status,
                message_text: '',
                should_sync_flag: true
            }
        }).then(() => {
            // Todo: should sync here or earlier in control chain
            this._reloadComponentState();
        });
    }

    etlReportComplexError(status) {
        this.etlStatusRecordId = status.status_record_id;
        this.$mdDialog.show({
            templateUrl: 'app/modals/mc-etl-status-dialog.html',
            controller: EtlStatusDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                status: status
            }
        }).then(
            () => {
                this.etlInProgress = false;
                this.etlStatusRecordId = null;
                this._reloadComponentState();
            },
            (status) => {
                this.etlInProgress = false;
                this.etlStatusRecordId = status.id;
                this._reloadComponentState();
            });
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
    constructor($mdDialog, Upload, etlServerAPI, sidenavGlobus, toast, User, globusEndpointSaver) {
        this.$mdDialog = $mdDialog;
        this.Upload = Upload;
        this.etlServerAPI = etlServerAPI;
        this.sidenavGlobus = sidenavGlobus;
        this.globusEndpointSaver = globusEndpointSaver;
        this.toast = toast;
        this.User = User;
        this.user_id = User.u();
        this.name = '';
        this.description = '';
        // for direct upload
        this.files = [];
        // for Project upload
        this.excelFile = '';

        // deprecated!
        // for Globus upload
        // let etlGlobus = this.globusEndpointSaver.getEtlEndpoint();
        // this.ep_uuid = etlGlobus.uuid;
        // this.base_path = etlGlobus.path;
        // this.spreadsheet_rel_path = etlGlobus.spreadsheet;
        // this.data_dir_rel_path = etlGlobus.data;
    }

    //deprecated!
    globus_upload_ok() {
        return this.name && this.ep_uuid && this.base_path
            && this.spreadsheet_rel_path && this.data_dir_rel_path
            && this.isAuthenticatedToGlobus;
    }

    project_upload_ok() {
        return this.name && (this.excelFile.length > 0);
    }

    etlInProject() {
        let data = {};
        data.project_id = this.project.id;
        data.excel_file_path = this.excelFile;
        this.etlServerAPI.createExperimentFromEtl(
            this.project.id, this.excelFile, this.name, this.description).then(
            (reply) => {
                this.$mdDialog.hide(reply);
            },
            (e) => {
                if (e.status === 502) {
                    this.toast.error('Excel file ETL; Service not available. Contact Admin.');
                } else if (e.status > 200) {
                    this.toast.error('Excel file ETL; Service not available. Code - ' + e.status + '. Contact Admin.');
                }
                this.$mdDialog.cancel(e);
            }
        );
    }

    //deprecated!
    uploadWithGlobus() {
        let data = {};
        data.project_id = this.project.id;
        data.name = this.name;
        data.description = this.description;
        data.globus_uuid = this.ep_uuid;
        data.globus_base_path = this.base_path;
        data.globus_excel_file = this.spreadsheet_rel_path;
        data.globus_data_dir = this.data_dir_rel_path;
        this.globusEndpointSaver.saveEtlEndpoint(this.base_path, this.ep_uuid, this.spreadsheet_rel_path, this.data_dir_rel_path);
        return this.etlServerAPI.startBackgroundEtlUpload(data).then(
            (reply) => {
                this.$mdDialog.hide(reply);
            },
            (e) => {
                if (e.status === 502) {
                    this.toast.error('Excel file uplaod; Service not available. Contact Admin.');
                } else if (e.status > 200) {
                    this.toast.error('Excel file uplaod; Service not available. Code - ' + e.status + '. Contact Admin.');
                }
                this.$mdDialog.cancel(e);
            }
        );
    }

    uploadDirect() {
        let data = {};
        data.project_id = this.project.id;
        data.name = this.name;
        data.description = this.description;
        data.file = this.files[0];
        this.isUploading = true;
        return this.Upload.upload({
            url: `api/etl/upload?apikey=${this.User.apikey()}`,
            data: data
        }).then(
            (uploaded) => {
                let results = {
                    status: 'DONE',
                    data: uploaded.data
                };
                this.$mdDialog.hide(results);
                this.isUploading = false;
            },
            (e) => {
                if (e.status === 502) {
                    this.toast.error('Excel file uplaod; Service not available. Contact Admin.');
                } else if (e.status > 200) {
                    this.toast.error('Excel file uplaod; Service not available. Code - ' + e.status + '. Contact Admin.');
                }
                this.$mdDialog.cancel(e);
                this.isUploading = false;
            }
        );
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

// deprecated!
class EtlStatusDialogController {
    /*@ngInject*/
    constructor($mdDialog, etlServerAPI, toast, User) {
        this.$mdDialog = $mdDialog;
        this.etlServerAPI = etlServerAPI;
        this.toast = toast;
        this.User = User;
        this.user_id = User.u();
    }

    done() {
        this.$mdDialog.hide(this.status);
    }

    dismiss() {
        this.$mdDialog.cancel(this.status);
    }

    isDone() {
        return (this.didFail() || this.didSucceed());
    }

    isError() {
        return (this.didFail() || (this.status.status === 'ERROR'));
    }

    didFail() {
        return (this.status.status === 'Fail');
    }

    didSucceed() {
        return (this.status.status === 'Success');
    }

}

// deprecated!
class EtlMessageDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    shouldSync() {
        return this.should_sync_flag;
    }

    dismiss() {
        this.$mdDialog.hide();
    }
}

angular.module('materialscommons').component('mcProjectHome', {
    template: require('./mc-project-home.html'),
    controller: MCProjectHomeComponentController,
});
