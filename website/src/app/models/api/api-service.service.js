/*@ngInject*/
function apiService(Restangular) {
    return Restangular.one('v2').one;
}

angular.module('materialscommons').factory('apiService', apiService);
