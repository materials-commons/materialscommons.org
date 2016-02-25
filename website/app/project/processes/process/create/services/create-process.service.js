(function(module) {
    module.factory('createProcess', createProcessService);
    createProcessService.$inject = ['projectsAPI'];
    function createProcessService(projectsAPI) {
        return function(projectID, process) {
            return projectsAPI.api(projectID).one('processes').customPOST(process).then(function (p) {
                if (projectsAPI.onChangeFn) {
                    projectsAPI.onChangeFn(p);
                }
                return p;
            });
        }
    }
}(angular.module('materialscommons')));
