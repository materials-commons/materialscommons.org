class EtlServerAPIService {
    /*@ngInject*/
    constructor(etlAPIRoute) {
        this.etlAPIRoute = etlAPIRoute;
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
}

angular.module('materialscommons').service('etlServerAPI', EtlServerAPIService);