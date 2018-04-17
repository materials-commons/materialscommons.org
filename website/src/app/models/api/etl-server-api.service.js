class EtlServerAPIService {
    /*@ngInject*/
    constructor(etlAPIRoute) {
        this.etlAPIRoute = etlAPIRoute;
        console.log('EtlServerAPIService - constructor', this.etlAPIRoute);
    }
    startBackgroundEtlUpload(data) {
        let route = this.etlAPIRoute('globus').one('stage');
        console.log('EtlServerAPIService - startUpload', route);
        console.log('EtlServerAPIService - startUpload', data);
        return route.customPOST(data).then(
            n => {
                let results = n.plain();
                console.log(results);
                return results;
            },
            e => {
                console.log("error", e);
                return null;
            });
    }

    getEtlStatus(statusRecordId) {
        let route = this.etlAPIRoute('globus').one('monitor');
        console.log('EtlServerAPIService - etlStatus', route);
        console.log('EtlServerAPIService - etlStatus', statusRecordId);
        data = {
            status_record_id: statusRecordId
        };
        return route.customPOST(data).then(
            r => {
                let results = r.plain();
                console.log("etlStatue", results);
                return results;
            },
            e => {
                console.log("error", e);
                return null;
            }
        );
    }
}

angular.module('materialscommons').service('etlServerAPI', EtlServerAPIService);