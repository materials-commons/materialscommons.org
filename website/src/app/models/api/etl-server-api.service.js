class EtlServerAPIService {
    /*@ngInject*/
    constructor(etlAPIRoute) {
        this.etlAPIRoute = etlAPIRoute;
        console.log('EtlServerAPIService - constructor', this.etlAPIRoute);
    }
    startBackgroundEtlUpload(data) {
        route = this.etlAPIRoute('globus').one('stage');
        console.log('EtlServerAPIService - startUpload', route);
        route.customPOST(data).then(n => n.plain());
    }
}

angular.module('materialscommons').service('etlServerAPI', EtlServerAPIService);