/*@ngInject*/
function projectsAPIRouteService(Restangular) {
    return _.partial(Restangular.one('v2').one, 'projects');
}

angular.module('materialscommons').factory('projectsAPIRoute', projectsAPIRouteService);