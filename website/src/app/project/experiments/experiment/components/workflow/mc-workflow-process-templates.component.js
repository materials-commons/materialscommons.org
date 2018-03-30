class MCWorkflowProcessTemplatesComponentController {
    /*@ngInit*/
    constructor(templates, workflowProcessTemplatesService) {
        this.templates = templates.get();
        this.recentlySelectedTemplates = workflowProcessTemplatesService.getRecentTemplates();
        this.sortOrder = workflowProcessTemplatesService.sortOrder;
        this.sortOrderRecentlySelected = workflowProcessTemplatesService.sortOrderRecentlySelected;
        this.workflowProcessTemplatesService = workflowProcessTemplatesService;
    }

    $onDestroy() {
        this.workflowProcessTemplatesService.sortOrder = this.sortOrder;
        this.workflowProcessTemplatesService.sortOrderRecentlySelected = this.sortOrderRecentlySelected;
    }

    chooseTemplate(t) {
        if (this.onSelected) {
            let i = _.findIndex(this.recentlySelectedTemplates, {name: t.name});
            if (i === -1) {
                this.recentlySelectedTemplates.push(t);
            }
            this.onSelected({templateId: t.name, processId: ''});
        }
    }
}

angular.module('materialscommons').component('mcWorkflowProcessTemplates', {
    template: require('./mc-workflow-process-templates.html'),
    controller: MCWorkflowProcessTemplatesComponentController,
    bindings: {
        onSelected: '&'
    }
});
