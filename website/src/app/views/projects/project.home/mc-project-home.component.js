import {Experiment} from '../../../project/experiments/experiment/components/tasks/experiment.model';

class MCProjectHomeComponentController {
    /*@ngInject*/

    constructor(User, $scope, experimentsAPI, toast, $state,
                $stateParams, editorOpts, $mdDialog,
                mcprojstore, mcprojectstore2, projectsAPI, etlServerAPI) {
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
        this.sortOrder = 'name';
        this.mcprojstore = mcprojstore;
        this.mcprojectstore2 = mcprojectstore2;
        this.projectsAPI = projectsAPI;
        this.etlServerAPI = etlServerAPI;
        this.etlStatusAvailable = false;
        this.etlInProgress = false;
        this.etlStatusRecordId = null;
        if (User.isAuthenticated()) {
            this.user = User.attr().fullname;
            this.isAdmin = User.attr().admin;
            this.isBetaUser = User.attr().beta_user;
        }
        $scope.editorOptions = editorOpts({height: 65, width: 50});
    }

    $onInit() {
        this.unsubscribe = this.mcprojstore.subscribe(this.mcprojstore.OTPROJECT, this.mcprojstore.EVUPDATE, () => {
            this._reloadComponentState();
        });
        this._reloadComponentState();
        this.etlServerAPI.getEtlStatusForProject(this.project.id).then(
            status => {
                // xconsolex.log("status for project", status);
                if (status && status.status) {
                    status = status.status;
                    // xconsolex.log("status record id", status.id);
                    // xconsolex.log("status value", status.status);
                    if (status.status === "Success" || status.status === "Failure"){
                        // xconsolex.log("No further status information");
                    } else {
                        this.etlInProgress = true;
                        this.etlStatusRecordId = status.id;
                    }
                }
                this.etlStatusAvailable = true;
            }
        );
        //this.getProjectActivities();
    }

    getProjectActivities() {
        this.projectsAPI.getActivities(this.project.id).then(
            (activities) => {
                activities.forEach(a => {
                    switch (a.item_type) {
                        case "project":
                            a.icon = "fa-briefcase";
                            break;
                        case "experiment":
                            a.icon = "fa-flask";
                            break;
                        case "file":
                            a.icon = "fa-files-o";
                            break;
                        case "sample":
                            a.icon = "fa-cubes";
                            break;
                        case "process":
                            a.icon = "fa-code-fork";
                            break;
                    }
                    a.message = `${a.event_type === 'create' ? 'Added' : 'Modified'} ${a.item_type} ${a.item_name}`;
                });
                this.activities = activities;
            }
        );
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

    _reloadComponentState() {
        this.project = this.mcprojstore.getProject(this.$stateParams.project_id);
        this.projectOverview = this.project.overview;
        let experimentsList = _.values(this.project.experiments);
        this.activeExperimentsCount = experimentsList.filter(e => e.status === 'active').length;
        this.onholdExperimentsCount = experimentsList.filter(e => e.status === 'on-hold').length;
        this.doneExperimentsCount = experimentsList.filter(e => e.status === 'done').length;
        this.getProjectExperiments();
        this.mcprojectstore2.reloadProject(this.$stateParams.project_id);
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
        let selected = this.experiments.filter(e => e.selected);
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

    etlStart(){
        // xconsolex.log("MCProjectHomeComponentController - etlStart()");
        this.$mdDialog.show({
            templateUrl: 'app/modals/mc-etl-upload-dialog.html',
            controller: EtlUploadDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                project: this.project,
            }
        }).then(
            (results) => {
                this.etlInProgress = true;
                // xconsolex.log("MCProjectHomeComponentController - etlStart() - results", results);
                this.etlStatusRecordId = results.status_record_id;
                if (results.status == "ERROR") {
                    this.etlReportComplexError(results);
                } else if (results.status == "DONE") {
                    this.etlInProgress = false;
                    // xconsolex.log("MCProjectHomeComponentController - etlStart() - done");
                    this.etlReportImmediateComplete(results);
                } else {
                    // xconsolex.log("MCProjectHomeComponentController - etlStart() - dialog ok");
                }
                this._reloadComponentState();
            },
            () => {
                // xconsolex.log("MCProjectHomeComponentController - etlStart() - dialog canceled");
            }
        );
    }

    etlReportImmediateComplete(status){
        // xconsolex.log("MCProjectHomeComponentController - etlReportImmediateComplete() - status", status);

        this.$mdDialog.show({
            templateUrl: 'app/modals/mc-etl-message-dialog.html',
            controller: EtlMessageDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                status: status,
                message_text: "",
                should_sync_flag: true
            }
        }).then(() => {
            // Todo: should sync here or eariler in control chain
            this._reloadComponentState();
        });
    }

    etlReportComplexError(status){
        // xconsolex.log("MCProjectHomeComponentController - etlReportComplexError() - status", status);
        this.etlStatusRecordId = status.status_record_id;
        // xconsolex.log("this.etlInProgress", this.etlInProgress);
        // xconsolex.log("this.etlStatusRecordId", this.etlStatusRecordId);
        // xconsolex.log("status", status);
        // xconsolex.log("MCProjectHomeComponentController - etlReportComplexError() - dialog");
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
                // xconsolex.log("MCProjectHomeComponentController - etlReportComplexError() - process done", status);
                this.etlInProgress = false;
                this.etlStatusRecordId = null;
                //let experiment_id = status.extras.experiment_id;
                // xconsolex.log("this.etlInProgress", this.etlInProgress);
                // xconsolex.log("this.etlStatusRecordId", this.etlStatusRecordId);
                // xconsolex.log("experiment_id = ",experiment_id);
                // TODO: verify usage
                // this.$state.go("project.experiment.workflow", {experiment_id: experiment_id});
                // this.$state.go('project.experiments.experiment', {experiment_id: experiment_id});
                this._reloadComponentState();
            },
            (status) => {
                // xconsolex.log("MCProjectHomeComponentController - etlReportComplexError() - dismiss", status);
                this.etlInProgress = false;
                this.etlStatusRecordId = status.id;
                // xconsolex.log("this.etlInProgress", this.etlInProgress);
                // xconsolex.log("this.etlStatusRecordId", this.etlStatusRecordId);
                this._reloadComponentState();
            });
    }

    etlMonitor(){
        // xconsolex.log("MCProjectHomeComponentController - etlMonitor() - query");
        this.etlServerAPI.getEtlStatus(this.etlStatusRecordId).then(
            status => {
                // xconsolex.log("MCProjectHomeComponentController - etlMonitor() - results");
                // xconsolex.log("this.etlInProgress", this.etlInProgress);
                // xconsolex.log("this.etlStatusRecordId", this.etlStatusRecordId);
                // xconsolex.log("status", status);
                // xconsolex.log("MCProjectHomeComponentController - etlMonitor() - dialog");
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
                        // xconsolex.log("MCProjectHomeComponentController - etlMonitor() - process done", status);
                        this.etlInProgress = false;
                        this.etlStatusRecordId = null;
                        //let experiment_id = status.extras.experiment_id;
                        // xconsolex.log("this.etlInProgress", this.etlInProgress);
                        // xconsolex.log("this.etlStatusRecordId", this.etlStatusRecordId);
                        // xconsolex.log("experiment_id = ",experiment_id);
                        // TODO: verify usage
                        // this.$state.go("project.experiment.workflow", {experiment_id: experiment_id});
                        // this.$state.go('project.experiments.experiment', {experiment_id: experiment_id});
                        this._reloadComponentState();
                    },
                    (status) => {
                        // xconsolex.log("MCProjectHomeComponentController - etlMonitor() - dismiss", status);
                        this.etlInProgress = true;
                        this.etlStatusRecordId = status.id;
                        // xconsolex.log("this.etlInProgress", this.etlInProgress);
                        // xconsolex.log("this.etlStatusRecordId", this.etlStatusRecordId);
                        this._reloadComponentState();
                    }
                );

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
    constructor($mdDialog, experimentsAPI, mcprojstore, toast, User) {
        this.$mdDialog = $mdDialog;
        this.experimentsAPI = experimentsAPI;
        this.experimentName = '';
        this.experimentDescription = '';
        this.mcprojstore = mcprojstore;
        this.toast = toast;
        this.user = User.u();
    }

    done() {
        if (this.canDeleteExperiments()) {
            let experimentIds = this.experiments.map(e => e.id);
            this.experimentsAPI.deleteExperiments(this.project.id, experimentIds).then(
                () => {
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

class EtlUploadDialogController {
    /*@ngInject*/
    constructor($mdDialog, Upload, etlServerAPI, toast, User) {
        this.$mdDialog = $mdDialog;
        this.Upload = Upload;
        this.etlServerAPI = etlServerAPI;
        this.toast = toast;
        this.User = User;
        this.user_id = User.u();
        this.name = "";
        this.description = "";
        this.files = [];
        // test data - uncomment the following to pre-populate the from with a working example
        // this.name = "Test Experiment";
        // this.description = "This is a demo of Excel Spreadsheet uploading and processing";
        // this.ep_uuid = '067ce67a-3bf1-11e8-b9b5-0ac6873fc732';
        // this.ep_spreadsheet = '/dataForTest/input.xlsx';
        // this.ep_data = '/dataForTest/data';
    }

    uploadWithGlobus() {
        // xconsolex.log("EtlUploadDialogController - Start upload with globus");
        let data = {};
        data.project_id = this.project.id;
        data.name = this.name;
        data.description = this.description;
        data.globus_uuid = this.ep_uuid;
        data.globus_excel_file = this.ep_spreadsheet;
        data.globus_data_dir = this.ep_data;
        // xconsolex.log("data to send = ", data);
        return this.etlServerAPI.startBackgroundEtlUpload(data).then (
            (reply) => {
                // xconsolex.log("EtlUploadDialogController setup completed", reply);
                this.$mdDialog.hide(reply);
            },
            (e) => {
                // xconsolex.log("upload failed", e);
                if (e.status === 502) {
                    // xconsolex.log("Service unavailable: 502");
                    this.toast.error("Excel file uplaod; Service not available. Contact Admin.");
                } else if (e.status > 200) {
                    // xconsolex.log("Service unavailable: " + e.status);
                    this.toast.error("Excel file uplaod; Service not available. Code - " + e.status + ". Contact Admin.");
                }
                this.$mdDialog.cancel(e);
            }
        );
    }

    uploadDirect() {
        // xconsolex.log("EtlUploadDialogController - Start upload direct");
        let data = {};
        data.project_id = this.project.id;
        data.name = this.name;
        data.description = this.description;
        let f = this.files[0];
        data.file = f;
        // xconsolex.log("data to send = ", data);
        this.isUploading = true;
        return this.Upload.upload({
            url: `api/etl/upload?apikey=${this.User.apikey()}`,
            data: data
        }).then(
            (uploaded) => {
                // xconsolex.log("upload completed", uploaded.data);
                let results = {
                    status: "DONE",
                    data: uploaded.data
                };
                this.$mdDialog.hide(results);
                this.isUploading = false;
            },
            (e) => {
                // xconsolex.log("upload failed", e);
                if (e.status === 502) {
                    // xconsolex.log("Service unavailable: 502");
                    this.toast.error("Excel file uplaod; Service not available. Contact Admin.");
                } else if (e.status > 200) {
                    // xconsolex.log("Service unavailable: " + e.status);
                    this.toast.error("Excel file uplaod; Service not available. Code - " + e.status + ". Contact Admin.");
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
        return (this.didFail() || (this.status.status === "ERROR"));
    }

    didFail() {
        return (this.status.status == "Fail");
    }

    didSucceed() {
        return (this.status.status == "Success");
    }

}

class EtlMessageDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    shouldSync(){
        return this.should_sync_flag;
    }

    dismiss() {
        this.$mdDialog.hide();
    }
}

angular.module('materialscommons').component('mcProjectHome', {
    template: require('./mc-project-home.html'),
    controller: MCProjectHomeComponentController
});
