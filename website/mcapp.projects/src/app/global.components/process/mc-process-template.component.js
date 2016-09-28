class MCProcessTemplateComponentController {
    /*@ngInject*/
    constructor(processesService, toast, $stateParams) {
        this.processesService = processesService;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
    }

    updateProcessName() {
        this.processesService.updateProcess(this.projectId, this.process.id, {name: this.process.name})
            .then(
                () => {
                    if (this.onChange) {
                        this.onChange();
                    }
                },
                () => this.toast.error('Unable to update process name')
            );
    }
}


angular.module('materialscommons').component('mcProcessTemplate', {
    templateUrl: 'app/global.components/process/mc-process-template.html',
    controller: MCProcessTemplateComponentController,
    bindings: {
        process: '<',
        onChange: '&'
    }
});
