class EtlServerAPIService {
    /*@ngInject*/
    constructor(etlAPIRoute) {
        this.etlAPIRoute = etlAPIRoute;
        // xconsolex.log('EtlServerAPIService - constructor', this.etlAPIRoute);
    }
    startBackgroundEtlUpload(data) {
        let route = this.etlAPIRoute('globus').one('stage');
        // xconsolex.log('EtlServerAPIService - startUpload', route);
        // xconsolex.log('EtlServerAPIService - startUpload', data);
        return route.customPOST(data).then(
            n => {
                let results = n.plain();
                // xconsolex.log(results);
                return results;
            },
            () => {
                // xconsolex.log("error", e);
                return null;
            });
    }

    getEtlStatus(statusRecordId) {
        let route = this.etlAPIRoute('globus').one('monitor');
        // xconsolex.log('EtlServerAPIService - etlStatus', route);
        // xconsolex.log('EtlServerAPIService - etlStatus', statusRecordId);
        let data = {
            status_record_id: statusRecordId
        };
        return route.customPOST(data).then(
            r => {
                let results = r.plain();
                // xconsolex.log("EtlServerAPIService - etlStatue", results);
                return results;
            },
            () => {
                // xconsolex.log("EtlServerAPIService - error", e);
                return null;
            }
        );
    }

    getEtlStatusForProject(projectId) {
        let route = this.etlAPIRoute('project').one('status');
        // xconsolex.log('EtlServerAPIService - status for project', route);
        // xconsolex.log('EtlServerAPIService - status for project', projectId);
        let data = {
            project_id: projectId
        };
        return route.customPOST(data).then(
            r => {
                let results = r.plain();
                // xconsolex.log("EtlServerAPIService - status for project", results);
                return results;
            },
            () => {
                // xconsolex.log("EtlServerAPIService - status for project - error", e);
                return null;
            }
        );
    }
}

angular.module('materialscommons').service('etlServerAPI', EtlServerAPIService);