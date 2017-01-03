class MCWorkflowProcessTemplatesComponentController {
    /*@ngInit*/
    constructor(templates) {
        this.templates = templates.get();
        this.templateTypes = [
            {
                title: 'CREATE SAMPLES',
                cssClass: 'mc-create-samples-color',
                icon: 'fa-cubes',
                margin: true,
                templates: this.templates.filter(t => t.process_type === 'create')
            },
            {
                title: 'TRANSFORMATION',
                cssClass: 'mc-transform-color',
                icon: 'fa-exclamation-triangle',
                templates: this.templates.filter(t => t.process_type === 'transform')
            },
            {
                title: 'MEASUREMENT',
                cssClass: 'mc-measurement-color',
                icon: 'fa-circle',
                templates: this.templates.filter(t => t.process_type === 'measurement')
            },
            {
                title: 'ANALYSIS',
                cssClass: 'mc-analysis-color',
                icon: 'fa-square',
                templates: this.templates.filter(t => t.process_type === 'analysis')
            }
        ];
    }

    chooseTemplate(t) {
        if (this.onSelected) {
            this.onSelected({templateId: t.name, processId: ''});
        }
    }
}

angular.module('materialscommons').component('mcWorkflowProcessTemplates', {
    templateUrl: 'app/project/experiments/experiment/components/processes/mc-workflow-process-templates.html',
    controller: MCWorkflowProcessTemplatesComponentController,
    bindings: {
        onSelected: '&'
    }
});
