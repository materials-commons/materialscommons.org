class WorkflowProcessTemplatesService {
    /*@ngInject*/
    constructor() {
        this.recentTemplates = [];
        this.sortOrder = 'name';
        this.sortOrderRecentlySelected = 'name';
    }

    getRecentTemplates() {
        return this.recentTemplates;
    }
}

angular.module('materialscommons').service('workflowProcessTemplatesService', WorkflowProcessTemplatesService);