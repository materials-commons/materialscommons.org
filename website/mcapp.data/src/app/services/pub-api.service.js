export function pubAPIService(Restangular) {
    'ngInject';

    return Restangular.one('pub').one;
}