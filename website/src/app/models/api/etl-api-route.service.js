/*@ngInject*/
function etlAPIRouteService(Restangular) {
    return Restangular.one('api').one('etl').one;
}

angular.module('materialscommons').factory('etlAPIRoute', etlAPIRouteService);
