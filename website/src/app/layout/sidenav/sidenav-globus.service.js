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

}

class GlobusUploadDialogController {
    /*@ngInject*/
    constructor($mdDialog, User, globusInterfaceAPI) {
        this.$mdDialog = $mdDialog;this.user =
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

//new Version
// class GlobusDownloadDialogController {
//     /*@ngInject*/
//     constructor($mdDialog, User, globusInterfaceAPI) {
//         this.$mdDialog = $mdDialog;
//         this.url = null;
//         this.error = null;
//         globusInterfaceAPI.setupDownloadEndpoint(this.project.id).then(
//             results => {
//                 if (results.globus_url) {
//                     this.url = results.globus_url;
//                 } else {
//                     this.error = results.error;
//                     if (!this.error) {
//                         this.error = 'Unexpected error, no URL: please contact site admin';
//                     }
//                 }
//             },
//             error => this.error = error
//         );
//     }
//
//     cancel() {
//         this.$mdDialog.cancel();
//     }
//
// }


// old version
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