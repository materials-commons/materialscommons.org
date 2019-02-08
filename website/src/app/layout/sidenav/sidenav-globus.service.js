class SidenavGlobusService {
    /*@ngInject*/
    constructor(User, etlServerAPI, $mdDialog) {
        this.User = User;
        this.etlServerAPI = etlServerAPI;
        this.$mdDialog = $mdDialog;
        this.globus_user = User.attr().globus_user;
    }

    globusDownload(project) {
        if (this.globus_user === '') {
            return this.noGlobusId();
        }
        return this.$mdDialog.show({
                templateUrl: 'app/modals/globus-download-dialog.html',
                controller: GlobusDownloadDialogController,
                controllerAs: '$ctrl',
                bindToController: true,
            clickOutsideToClose: true,
                locals: {
                    project: project,
                }
            }
        );
    }

    globusUpload(project) {
        if (this.globus_user === '') {
            return this.noGlobusId();
        }
        return this.$mdDialog.show({
                templateUrl: 'app/modals/globus-upload-dialog.html',
                controller: GlobusUploadDialogController,
                controllerAs: '$ctrl',
                bindToController: true,
            clickOutsideToClose: true,
                locals: {
                    project: project,
                }
            }
        );
    }

    noGlobusId() {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/globus_id_missing.html',
            controller: NoGlobusIdDialogController,
            controllerAs: '$ctrl',
            clickOutsideToClose: true,
        });
    }

    showUploadStatus(project) {
        console.log('showUploadStatus', project.name);
        return this.$mdDialog.show({
                templateUrl: 'app/modals/globus-upload-status-dialog.html',
                controller: GlobusUploadStatusDialogController,
                controllerAs: '$ctrl',
                bindToController: true,
            clickOutsideToClose: true,
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
    }

    dismiss() {
        this.$mdDialog.cancel();
    }

    cancel() {
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
        this.submitRequest();
    }

    submitRequest() {
        this.error = null;
        this.status = null;
        this.activeCount = 0;
        this.successCount = 0;
        this.finishedCount = 0;
        this.etlServerAPI.getGlobusUplaodStatus(this.project.id).then(
            results => {
                if (results.value) {
                    this.activeCount = 0;
                    this.finishedCount = 0;
                    this.successCount = 0;
                    let record_list = results.value;
                    let now = new Date();
                    for (let i = 0; i < record_list.length; i++) {
                        let record = record_list[i];
                        record.birthtime = this.convert_date(record.birthtime);
                        record.mtime = this.convert_date(record.mtime);
                        record.age_in_minutes = (now - record.birthtime) / 60000;
                        record.formatted_age = this.format_age(record.age_in_minutes);
                        if (record.is_ok) {
                            this.successCount += 1;
                        }
                        if (record.is_finished) {
                            this.finishedCount += 1;
                        }
                        if (record.is_ok && !record.is_finished) {
                            this.activeCount += 1;
                        }
                    }
                    this.status = record_list;
                } else {
                    this.error = results.error;
                }
            }
        );
    }

    format_age(mins) {
        let hours = Math.floor(mins / 60);
        let minutes = Math.round(mins - (hours * 60));
        return '' + hours + ':' + ((minutes < 10) ? ('0' + minutes) : '' + minutes);
    }

    convert_date(epoch_seconds) {
        let d = new Date(0);
        d.setUTCSeconds(epoch_seconds);
        return d;
    }

    reload() {
        this.submitRequest();
    }

    dismiss() {
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
