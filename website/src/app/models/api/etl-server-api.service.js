class EtlServerAPIService {
    /*@ngInject*/
    constructor(etlAPIRoute) {
        this.etlAPIRoute = etlAPIRoute;
    }
    startBackgroundEtlUpload(data) {
        let route = this.etlAPIRoute('globus').one('stage');
        return route.customPOST(data).then(
            n => {
                // noinspection UnnecessaryLocalVariableJS
                let results = n.plain();
                return results;
            },
            () => {
                return null;
            });
    }

    getEtlStatus(statusRecordId) {
        let route = this.etlAPIRoute('globus').one('monitor');
        let data = {
            status_record_id: statusRecordId
        };
        return route.customPOST(data).then(
            r => {
                // noinspection UnnecessaryLocalVariableJS
                let results = r.plain();
                return results;
            },
            () => {
                return null;
            }
        );
    }

    getEtlStatusForProject(projectId) {
        let route = this.etlAPIRoute('project').one('status');
        let data = {
            project_id: projectId
        };
        return route.customPOST(data).then(
            r => {
                // noinspection UnnecessaryLocalVariableJS
                let results = r.plain();
                return results;
            },
            () => {
                return null;
            }
        );
    }

    setupGlobusDownloadTransfer(projectId, globusUsername) {
        let route = this.etlAPIRoute('globus').one('transfer').one('download');
        let data = {
            project_id: projectId,
            globus_user: globusUsername
        };
        return route.customPOST(data).then(
            r => {
                // noinspection UnnecessaryLocalVariableJS
                let results = r.plain();
                return results;
            },
            () => {
                return null;
            }
        );
    }

    setupGlobusUploadTransfer(projectId, endpoint) {
        let route = this.etlAPIRoute('globus').one('transfer').one('upload');
        let data = {
            project_id: projectId,
            endpoint: endpoint
        };
        return route.customPOST(data).then(
            r => {
                // noinspection UnnecessaryLocalVariableJS
                let results = r.plain();
                return results;
            },
            () => {
                return null;
            }
        );
    }

    // noinspection JSMethodCanBeStatic
    getRecentGlobusStatus(projectId){
        let route = this.etlAPIRoute('globus').one('transfer').one('status');
        let data = {
            project_id: projectId
        };
        return route.customPOST(data).then(
            r => {
                // noinspection UnnecessaryLocalVariableJS
                let results = r.plain();
                return results;
            }
        );
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    getSystemGlobusInformation(){
        let route = this.etlAPIRoute('globus').one('transfer').one('info');
        return route.get().then(
            r => {
                // noinspection UnnecessaryLocalVariableJS
                let results = r.plain();
                return results;
            }
        );
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    getGlobusTransferAdminInfo() {
        let route = this.etlAPIRoute('globus').one('transfer').one('admin').one('info');
        let data = {};
        return route.customPOST(data).then(
            r => {
                // noinspection UnnecessaryLocalVariableJS
                let results = r.plain();
                return results;
            }
        );
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    getGlobusTransferAdminStatus(){
        let route = this.etlAPIRoute('globus').one('transfer').one('admin').one('status');
        let data = {};
        return route.customPOST(data).then(
            r => {
                // noinspection UnnecessaryLocalVariableJS
                let results = r.plain();
                return results;
            }
        );
    }

    // -- /globus/transfer/admin/cctasks
    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    getGlobusConfidentialClientTaskList(){
        let route = this.etlAPIRoute('globus').one('transfer').one('admin').one('cctasks');
        let data = {};
        return route.customPOST(data).then(
            r => {
                // noinspection UnnecessaryLocalVariableJS
                let results = r.plain();
                return results;
            }
        );
    }

    getGlobusAuthStatus() {
        let route = this.etlAPIRoute('globus').one('auth').one('status');
        let data = {};
        return route.customPOST(data).then(
            r => {
                // noinspection UnnecessaryLocalVariableJS
                let results = r.plain();
                return results;
            }
        );
    }

    globusLogin() {
        let route = this.etlAPIRoute('globus').one('auth').one('login');
        let data = {};
        return route.customPOST(data).then(
            r => {
                // noinspection UnnecessaryLocalVariableJS
                let results = r.plain();
                return results;
            }
        );
    }

    globusLogout() {
        let route = this.etlAPIRoute('globus').one('auth').one('logout');
        let data = {};
        return route.customPOST(data).then(
            r => {
                // noinspection UnnecessaryLocalVariableJS
                let results = r.plain();
                return results;
            }
        );
    }

}

angular.module('materialscommons').service('etlServerAPI', EtlServerAPIService);