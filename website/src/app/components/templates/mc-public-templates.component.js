class MCPublicTemplatesComponentController {
    /*@ngInject*/
    constructor(templatesAPI) {
        console.log("MCPublicTemplatesComponentController - constructor");
        this.templatesAPI = templatesAPI;
        this.templates = null;
        this.templateLoaded = false;
    }

    $onInit() {
        console.log("MCPublicTemplatesComponentController - init");
        this.templatesAPI.getAllTemplates().then(
            (templates) => {
                console.log("MCPublicTemplatesComponentController - templates", templates.length);
                let index = 0;
                for (var i = 0; i < templates.length; i++) {
                    if (templates[i].name === "SEM") {
                        index = i;
                    }
                }
                console.log(index, templates[index]);
                this.templates = templates;
                this.templateLoaded = true;
            }
        );
    }

    showTemplateDetails(template) {
        console.log("Show details for", template.name);
    }

}

angular.module('materialscommons').component('mcPublicTemplates', {
    template: require('./mc-public-templates.html'),
    controller: MCPublicTemplatesComponentController
});
