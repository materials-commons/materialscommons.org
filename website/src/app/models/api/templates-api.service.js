class TemplatesAPIService {
    constructor(Restangular) {
        this.Restangular = Restangular;
    }

    createTemplate(template) {
        return this.Restangular.one('v2').one('templates').customPOST(template);
    }

    getAllTemplates() {
        return this.Restangular.one('v2').one('templates').get();
    }

    updateTemplate(template) {
        return this.Restangular.one('v2').one('templates', template.id).customPUT(template);
    }
}

angular.module('materialscommons').service('templatesAPI', TemplatesAPIService);
