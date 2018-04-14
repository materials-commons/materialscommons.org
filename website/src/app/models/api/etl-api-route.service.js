/*@ngInject*/
function etlAPIRouteService(Restangular) {
    return Restangular.one('etl').one;
}

angular.module('materialscommons').factory('etlAPIRoute', etlAPIRouteService);
