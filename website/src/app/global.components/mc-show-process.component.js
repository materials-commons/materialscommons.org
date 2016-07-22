class MCShowProcessComponentController {
    /*@ngInject*/
    constructor($stateParams, projectsService, toast, templates, processEdit) {
        this.projectId = $stateParams.project_id;
        this.projectsService = projectsService;
        this.toast = toast;
        this.templates = templates;
        this.processEdit = processEdit;
    }

    $onInit() {
        this.projectsService.getProjectProcess(this.projectId, this.processId)
            .then(
                (process) => {
                    this.process = process;
                    let templateName = process.process_name ? process.process_name : process.template_id.substring(7);
                    var t = this.templates.getTemplate(templateName);
                    this.process = this.processEdit.fillProcess(t, process);
                    console.log('projectProcess', this.process.plain());
                    this.files = process.input_files.concat(process.output_files);
                },
                () => this.toast.error('Unable to retrieve process details')
            );
    }
}

angular.module('materialscommons').component('mcShowProcess', {
    templateUrl: 'app/global.components/mc-show-process.html',
    controller: MCShowProcessComponentController,
    bindings: {
        processId: '<'
    }
});
