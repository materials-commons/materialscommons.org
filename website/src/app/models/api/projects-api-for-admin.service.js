class ProjectsAPIForAdminService { 
    constructor(apiActionheroRoute){
        this.apiActionheroRoute = apiActionheroRoute
    }
    
    getProjectsForAdmin() {
        return this.apiActionheroRoute('listProjectsForAdmin').customPOST({}).then(
            (rv) => {
                rv = rv.plain();
                return rv.data;
            }
        );
    }
}

angular.module('materialscommons').service('projectsAPIForAdmin', ProjectsAPIForAdminService);
