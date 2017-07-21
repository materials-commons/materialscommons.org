/*@ngInject*/
function publicAPIRouteService(Restangular) {
    return Restangular.one('pub').one;
}

angular.module('materialscommons').factory('publicAPIRoute', publicAPIRouteService);
