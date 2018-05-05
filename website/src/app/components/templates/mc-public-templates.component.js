class MCTemplateSummaryComponentController {
    /*@ngInject*/
    constructor(templatesAPI) {
        this.templatesAPI = templatesAPI;
    }

    $onInit() {
        console.log("MCTemplateSummaryComponentController - init");
        this.templatesAPI.getAllTemplates().then(
            (templates) => {
                for (let i = 0; i < templates.length; i++) {
                    let t = templates[i];
                    t.can_edit = this.user.isTemplateAdmin() || (this.user.attr().id === t.owner);
                }
                this.templates = templates;
                if (reloadCache) {
                    this.templatesService.set(templates);
                }
            }
        );
    }

}

angular.module('materialscommons').component('mcTemplateSummary', {
    template: require('./mc-template-summary.html'),
    controller: MCTemplateSummaryComponentController
});
