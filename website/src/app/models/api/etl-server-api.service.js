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
}

angular.module('materialscommons').service('etlServerAPI', EtlServerAPIService);