export function mcapiService(Restangular) {
    'ngInject';
    return Restangular.one('v2').one;
}
