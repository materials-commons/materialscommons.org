class GlobusInterfaceAPIService {
    /*@ngInject*/
    constructor (globusInterfaceRoute) {
        this.globusInterfaceRoute = globusInterfaceRoute;
    }

    setupUploadEndpoint(projectId) {
        console.log('setupUploadUrl');
        let route = this.globusInterfaceRoute('createGlobusUploadRequest');
        let data = {
            project_id: projectId
        };
        console.log('setupUploadUrl', route);
        console.log('setupUploadUrl', data);
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