class SidenavGlobusService {
    /*@ngInject*/
    constructor(User, etlServerAPI, $mdDialog) {
        this.User = User;
        this.etlServerAPI = etlServerAPI;
        this.$mdDialog = $mdDialog;
    }

    globusDownload(project) {
        return this.$mdDialog.show({
                templateUrl: 'app/modals/globus-download-transfer-dialog.html',
                controller: GlobusDownloadTransferDialogController,
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
                templateUrl: 'app/modals/globus-upload-transfer-dialog.html',
                controller: GlobusUploadTransferDialogController,
                controllerAs: '$ctrl',
                bindToController: true,
                locals: {
                    project: project,
                }
            }
        );
    }

    showGlobusTasks(project) {
        return this.$mdDialog.show({
                templateUrl: 'app/modals/globus-report-status-dialog.html',
                controller: GlobusReportStatusDialogController,
                controllerAs: '$ctrl',
                bindToController: true,
                locals: {
                    project: project,
                }
            }
        );
    }

    loginToGlobus() {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/globus-login-dialog.html',
            controller: GlobusLoginDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {}
        });
    }

    isAuthenticated() {
        return this.etlServerAPI.getGlobusAuthStatus().then(status => status.authenticated, () => false);
    }
}

class GlobusDownloadTransferDialogController {
    /*@ngInject*/
    constructor($mdDialog, etlServerAPI) {
        this.$mdDialog = $mdDialog;
        this.etlServerAPI = etlServerAPI;
        this.requestComplete = false;
        this.globusUser = 'username@globus.com';
        this.url = '';
    }

    submitToServer() {
        console.log('Submitting request to server: ', this.project.id, this.globusUser);
        this.etlServerAPI.setupGlobusDownloadTransfer(this.project.id, this.globusUser)
            .then(globusResults => {
                console.log('Results returned from server: ', globusResults);
                if (globusResults && globusResults.url) {
                    this.url = globusResults.url;
                    this.requestComplete = true;
                }
            });
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class GlobusUploadTransferDialogController {
    /*@ngInject*/
    constructor($mdDialog, etlServerAPI) {
        this.$mdDialog = $mdDialog;
        this.etlServerAPI = etlServerAPI;
        this.endpoint = '';
        this.uploadName = 'undefined';
        this.uploadUniquename = 'undefined';
        this.uploadId = 'undefined';
        this.status = '';
        this.etlServerAPI.getSystemGlobusInformation()
            .then(infoResults => {
                console.log('Info results returned from server: ', infoResults);
                this.uploadName = infoResults.upload_user_name;
                this.uploadUniquename = infoResults.upload_user_unique_name;
                this.uploadId = infoResults.upload_user_id;
            });
    }

    submitToServer() {
        console.log('Submitting request to server: ', this.project.id, this.endpoint);
        this.etlServerAPI.setupGlobusUploadTransfer(this.project.id, this.endpoint)
            .then(globusResults => {
                console.log('Results returned from server: ', globusResults);
                if (globusResults) {
                    this.status = globusResults.status;
                    this.status_record_id = globusResults.status_record_id;
                }
                else {
                    this.status = 'FAIL';
                }
            });
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class GlobusReportStatusDialogController {
    /*@ngInject*/
    constructor($mdDialog, etlServerAPI) {
        this.$mdDialog = $mdDialog;
        this.etlServerAPI = etlServerAPI;
        this.statusReportList = [];
        console.log('GlobusReportStatusDialogController - Fetching status');
        this.etlServerAPI.getRecentGlobusStatus(this.project.id)
            .then(results => {
                this.statusReportList = results.status_list;
                for (let i = 0; i < this.statusReportList.length; i++) {
                    let d = new Date(0);
                    d.setUTCSeconds(this.statusReportList[i].timestamp);
                    let iso = d.toISOString().match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);
                    this.statusReportList[i].timestamp = iso[1] + ' ' + iso[2];
                }
                console.log(this.statusReportList);
            });
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class GlobusLoginDialogController {
    /*@ngInject*/
    constructor($mdDialog, etlServerAPI) {
        this.$mdDialog = $mdDialog;
        this.etlServerAPI = etlServerAPI;
    }
}

angular.module('materialscommons').service('sidenavGlobus', SidenavGlobusService);