/*@ngInject*/
function globusInterfaceRouteService(Restangular) {
    return Restangular.one('v4').one;
}

angular.module('materialscommons').factory('globusInterfaceRoute', globusInterfaceRouteService);
