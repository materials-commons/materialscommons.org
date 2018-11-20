class EtlServerAPIService {
    /*@ngInject*/
    constructor(etlAPIRoute) {
        this.etlAPIRoute = etlAPIRoute;
    }

    createExperimentFromEtl(projectId, excelFilePath, experiment_name, experiment_desc) {
        let route = this.etlAPIRoute('project').one('etl');
        let data = {
            project_id: projectId,
            file_path: excelFilePath,
            experiment_name: experiment_name,
            experiment_desc: experiment_desc
        };
        return route.customPOST(data).then(
            n => {
                // noinspection UnnecessaryLocalVariableJS
                let results = n.plain();
                return results;
            },
            (e) => {
                console.log("etl returns error", e);
                return e;
            });
    }

    getGlobusUplaodStatus(projectId) {
        let route = this.etlAPIRoute('globus').one('upload').one('status');
        let data = {
            project_id: projectId
        };
        return route.customPOST(data).then(
            r => {
                // noinspection UnnecessaryLocalVariableJS
                let results = r.plain();
                return {'status': results};
            },
            e => {
                let message =
                    "Status server not available or internal server error occurred: " + e.status;
                return {'error': message};
            }
        );
    }

    // deprecated!
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

    // deprecated!
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

    // deprecated!
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

    setupGlobusDownloadTransfer(projectId) {
        let route = this.etlAPIRoute('globus').one('transfer').one('download');
        let data = {
            project_id: projectId,
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

    setupGlobusUploadTransfer(projectId, endpoint, path) {
        let route = this.etlAPIRoute('globus').one('transfer').one('upload');
        let data = {
            project_id: projectId,
            endpoint: endpoint,
            path: path
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

    // deprecated!
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

    // deprecated!
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

    // deprecated!
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

    // deprecated!
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

    // deprecated!
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

    // deprecated!
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

    // deprecated!
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

    // deprecated!
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