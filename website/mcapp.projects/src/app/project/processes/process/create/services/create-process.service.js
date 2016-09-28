angular.module('materialscommons').factory('createProcess', createProcessService);

/*@ngInject*/
function createProcessService(projectsAPI, onChangeService) {
    return function(projectID, process) {
        return projectsAPI(projectID).one('processes').customPOST(process).then(function(p) {
            onChangeService.execif(p);
            return p;
        });
    }
}