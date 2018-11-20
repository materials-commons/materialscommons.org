class SidenavGlobusService {
    /*@ngInject*/
    constructor(User, etlServerAPI, $mdDialog) {
        this.User = User;
        this.etlServerAPI = etlServerAPI;
        this.$mdDialog = $mdDialog;
    }

    globusDownload(project) {
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
        this.User = User;
        this.etlServerAPI = etlServerAPI
        this.globusUser = User.attr().globus_user;
        this.url = null;
        this.error = null;
        this.count = 0;
        this.status = null;
        console.log("this.globusUser = ", this.globusUser, this.project.name);
        this.submitRequest();
    }

    submitRequest() {
        this.error = null;
        this.status = null;
        console.log("submitting request to update status", this.project.name);
        this.etlServerAPI.getGlobusUplaodStatus(this.project.id).then(
            results => {
                console.log("Results from request to update status", results);
                if (results.status) {
                    this.status = results.status;
                } else {
                    this.error = results.error;
                }
            }
        );
    }

    reload() {
        this.count = this.count + 1;
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