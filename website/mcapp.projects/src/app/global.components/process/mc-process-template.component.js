class MCProcessTemplateComponentController {
    /*@ngInject*/
    constructor($scope, editorOpts, processesService, toast, $stateParams) {
        this.processesService = processesService;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
        $scope.editorOptions = editorOpts({height: 25, width: 20});
        this.processDescription = this.process.description;
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

    updateProcessDescription() {
        if (this.processDescription === this.process.description) {
            return;
        }

        if (this.process.description === null) {
            return;
        }

        this.processesService.updateProcess(this.projectId, this.process.id, {description: this.process.description}).then(
            () => this.processDescription = this.process.description,
            () => this.toast.error('Unable to update process description')
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
