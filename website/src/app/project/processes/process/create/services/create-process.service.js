angular.module('materialscommons').factory('createProcess', createProcessService);

/*@ngInject*/
function createProcessService(projectsAPIRoute, onChangeService) {
    return function(projectID, process) {
        return projectsAPIRoute(projectID).one('processes').customPOST(process).then(function(p) {
            onChangeService.execif(p);
            return p;
        });
    }
}