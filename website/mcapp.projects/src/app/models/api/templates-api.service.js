class TemplatesAPIService {
    constructor(Restangular) {
        this.Restangular = Restangular;
    }

    createTemplate(template) {
        return this.Restangular.one('v2').one('templates').customPOST(template);
    }
}

angular.module('materialscommons').service('templatesAPI', TemplatesAPIService);
