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
                return results;
            },
            e => {
                let message =
                    "Status server not available or internal server error occurred: " + e.status;
                return {'error': message};
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
}

angular.module('materialscommons').service('etlServerAPI', EtlServerAPIService);