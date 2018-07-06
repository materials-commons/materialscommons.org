class EtlServerAPIService {
    /*@ngInject*/
    constructor(etlAPIRoute) {
        this.etlAPIRoute = etlAPIRoute;
    }
    startBackgroundEtlUpload(data) {
        let route = this.etlAPIRoute('globus').one('stage');
        return route.customPOST(data).then(
            n => {
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
                let results = r.plain();
                return results;
            },
            () => {
                return null;
            }
        );
    }

    getRecentGlobusStatus(projectId){
        let route = this.etlAPIRoute('globus').one('transfer').one('status');
        let data = {
            project_id: projectId
        };
        return route.customPOST(data).then(
            r => {
                let results = r.plain();
                return results;
            }
        );
    }

}

angular.module('materialscommons').service('etlServerAPI', EtlServerAPIService);