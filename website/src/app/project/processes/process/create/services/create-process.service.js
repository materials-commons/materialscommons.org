angular.module('materialscommons').factory('createProcess', createProcessService);

function createProcessService(projectsAPI, onChangeService) {
    'ngInject';

    return function(projectID, process) {
        console.dir(process);
        return projectsAPI(projectID).one('processes').customPOST(process).then(function(p) {
            onChangeService.execif(p);
            return p;
        });
    }
}