class SidenavGlobusService {
    /*@ngInject*/
    constructor(User, etlServerAPI, $mdDialog) {
        this.User = User;
        this.etlServerAPI = etlServerAPI;
        this.$mdDialog = $mdDialog;
        this.globus_user = User.attr().globus_user;
        console.log("for user = ", User.u(), ", globus user =", this.globus_user);
    }

    globusDownload(project) {
        console.log("this.globus_user", this.globus_user);
        console.log((this.globus_user === ''));
        if (this.globus_user === '') {
            return this.noGlobusId();
        }
        return this.$mdDialog.show({
                templateUrl: 'app/modals/globus-download-dialog.html',
                controller: GlobusDownloadDialogController,
                controllerAs: '$ctrl',
                bindToController: true,
                locals: {
                    project: project,
                }
            }
        );
    }

    globusUpload(project) {
        console.log("this.globus_user", this.globus_user);
        console.log((this.globus_user === ''));
        if (this.globus_user === '') {
            return this.noGlobusId();
        }
        return this.$mdDialog.show({
                templateUrl: 'app/modals/globus-upload-dialog.html',
                controller: GlobusUploadDialogController,
                controllerAs: '$ctrl',
                bindToController: true,
                locals: {
                    project: project,
                }
            }
        );
    }

    noGlobusId(){
        return this.$mdDialog.show({
            templateUrl: 'app/modals/globus_id_missing.html',
            controller: NoGlobusIdDialogController,
            controllerAs: '$ctrl'
        });
    }

    showUploadStatus(project) {
        console.log("showUploadStatus", project.name);
        return this.$mdDialog.show({
                templateUrl: 'app/modals/globus-upload-status-dialog.html',
                controller: GlobusUploadStatusDialogController,
                controllerAs: '$ctrl',
                bindToController: true,
                locals: {
                    project: project,
                }
            }
        );
    }

}

class NoGlobusIdDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        console.log('NoGlobusIdDialogController');
    }

    dismiss() {
        console.log('NoGlobusIdDialogController - dismiss');
        this.$mdDialog.cancel();
    }

    cancel() {
        console.log('NoGlobusIdDialogController - cancel');
        this.$mdDialog.cancel();
    }
}

class GlobusUploadDialogController {
    /*@ngInject*/
    constructor($mdDialog, User, globusInterfaceAPI) {
        this.$mdDialog = $mdDialog;
        this.User = User;
        this.globusUser = User.attr().globus_user;
        this.url = null;
        this.error = null;
        console.log("this.globusUser = ",this.globusUser);
        globusInterfaceAPI.setupUploadEndpoint(this.project.id).then(
            results => {
                if (results.globus_url) {
                    this.url = results.globus_url;
                } else {
                    this.error = results.error;
                    if (!this.error) {
                        this.error = 'Unexpected error, no URL: please contact site admin';
                    }
                }
            },
            error => this.error = error
        );
    }

    dismiss() {
        this.$mdDialog.cancel();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class GlobusUploadStatusDialogController {
    /*@ngInject*/
    constructor($mdDialog, User, etlServerAPI) {
        this.$mdDialog = $mdDialog;
        this.etlServerAPI = etlServerAPI;
        this.url = null;
        this.error = null;
        this.status = null;
        console.log("this.globusUser = ", this.globusUser, this.project.name);
        this.submitRequest();
    }

    submitRequest() {
        this.error = null;
        this.status = null;
        this.activeCount = 0;
        this.successCount = 0;
        this.finishedCount = 0;
        console.log("submitting request to update status", this.project.name);
        this.etlServerAPI.getGlobusUplaodStatus(this.project.id).then(
            results => {
                if (results.value) {
                    console.log("Results from request to update status", results.value);
                    this.activeCount = 0;
                    this.finishedCount = 0;
                    this.successCount = 0;
                    let record_list = results.value;
                    let now = new Date()
                    for (let i = 0; i < record_list.length; i++) {
                        let record = record_list[i];
                        record.birthtime = this.convert_date(record.birthtime);
                        record.mtime = this.convert_date(record.mtime);
                        record.age_in_minutes = (now - record.birthtime)/60000;
                        record.formatted_age = this.format_age(record.age_in_minutes);
                        if (record.is_ok) {
                            this.successCount += 1
                        }
                        if (record.is_finished) {
                            this.finishedCount += 1
                        }
                        if (record.is_ok && !record.is_finished) {
                            this.activeCount += 1
                        }
                    }
                    console.log("Results converted", record_list);
                    this.status = record_list;
                } else {
                    this.error = results.error;
                }
            }
        );
    }

    format_age(mins) {
        let hours = Math.floor(mins/60);
        let minutes = Math.round(mins - (hours*60));
        return "" + hours + ':' + ((minutes<10)?("0" + minutes):"" + minutes);
    }

    convert_date(epoch_seconds) {
        let d = new Date(0);
        d.setUTCSeconds(epoch_seconds);
        return d;
    }
    reload() {
        console.log("GlobusUploadStatusDialogController-Reload");
        this.submitRequest();
    }

    dismiss() {
        console.log("GlobusUploadStatusDialogController-Dismiss");
        this.$mdDialog.cancel();
    }
}

class GlobusDownloadDialogController {
    /*@ngInject*/
    constructor($mdDialog, etlServerAPI) {
        this.$mdDialog = $mdDialog;
        this.etlServerAPI = etlServerAPI;
        this.url = null;
        this.error = null;
        this.etlServerAPI.setupGlobusDownloadTransfer(this.project.id).then(
            results => {
                if (results.url) {
                    this.url = results.url;
                } else {
                    this.error = results.error;
                    if (!this.error) {
                        this.error = 'Unexpected error, no URL: please contact site admin';
                    }
                }
            },
            error => this.error = error
        );
    }

    cancel() {
        this.$mdDialog.cancel();
    }

}

angular.module('materialscommons').service('sidenavGlobus', SidenavGlobusService);