(function (module) {
    module.factory('projectsAPI', projectsAPIService);
    projectsAPIService.$inject = ['Restangular'];
    function projectsAPIService(Restangular) {
        return _.partial(Restangular.one('v2').one, 'projects');
    }
}(angular.module('materialscommons')));
