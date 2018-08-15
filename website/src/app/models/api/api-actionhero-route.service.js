/*@ngInject*/
function apiActionheroRoute(Restangular) {
    return Restangular.one('v3').one;
}

angular.module('materialscommons').factory('apiActionheroRoute', apiActionheroRoute);
