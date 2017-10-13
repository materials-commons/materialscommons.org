class TemplatesAPIService {
    constructor(Restangular) {
        this.Restangular = Restangular;
    }

    createTemplate(template) {
        return this.Restangular.one('v2').one('templates').customPOST(template).then(template => template.plain());
    }

    getAllTemplates() {
        return this.Restangular.one('v2').one('templates').get().then(templates => templates.plain());
    }

    updateTemplate(template) {
        return this.Restangular.one('v2').one('templates', template.id).customPUT(template).then(t => t.plain());
    }
}

angular.module('materialscommons').service('templatesAPI', TemplatesAPIService);
