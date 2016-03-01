(function(module) {
    module.factory('createProcess', createProcessService);
    createProcessService.$inject = ['projectsAPI', 'onChangeService'];
    function createProcessService(projectsAPI, onChangeService) {
        return function(projectID, process) {
            console.dir(process);
            return projectsAPI(projectID).one('processes').customPOST(process).then(function (p) {
                onChangeService.execif(p);
                return p;
            });
        }
    }
}(angular.module('materialscommons')));
