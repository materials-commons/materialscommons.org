class GlobusInterfaceAPIService {
    /*@ngInject*/
    constructor (globusInterfaceRoute) {
        this.globusInterfaceRoute = globusInterfaceRoute;
    }

    setupUploadEndpoint(userId, projectId) {
        console.log('setupDownloadUrl');
        let route = this.globusInterfaceRoute('setupUploadEndpoint');
        let data = {
            user_id: userId,
            project_id: projectId
        };
        return route.customPOST(data).then(
            r => {
                console.log('setupUploadEndpoint - normal return');
                // noinspection UnnecessaryLocalVariableJS
                let results = r.plain();
                console.log('setupUploadEndpoint - results', results);
                return results;
            },
            () => {
                console.log('setupUploadEndpoint - error return');
                return null;
            }
        );
    }
}

angular.module('materialscommons').service('globusInterfaceAPI', GlobusInterfaceAPIService);