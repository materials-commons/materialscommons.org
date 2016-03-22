angular.module('materialscommons').factory('samplesService', samplesService);

/*@ngInject*/
function samplesService(projectsAPI) {
    return {
        getProjectSamples: function(projectID) {
            return projectsAPI(projectID).one('samples').getList();
        }
    }
}
