export function projectsAPIService(Restangular) {
    'ngInject';

    return _.partial(Restangular.one('v2').one, 'projects');
}

