class MCPublicTemplatesComponentController {
    /*@ngInject*/
    constructor(templatesAPI) {
        console.log("MCPublicTemplatesComponentController - constructor");
        this.templatesAPI = templatesAPI;
    }

    $onInit() {
        console.log("MCPublicTemplatesComponentController - init");
        this.templatesAPI.getAllTemplates().then(
            (templates) => {
                console.log("MCPublicTemplatesComponentController - templates", templates);
                this.templates = templates;
            }
        );
    }

}

angular.module('materialscommons').component('mcPublicTemplates', {
    template: require('./mc-public-templates.html'),
    controller: MCPublicTemplatesComponentController
});
