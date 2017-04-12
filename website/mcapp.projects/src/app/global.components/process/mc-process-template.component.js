class MCProcessTemplateComponentController {
    /*@ngInject*/
    constructor($scope, editorOpts, processesAPI, toast, $stateParams) {
        this.processesAPI = processesAPI;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
        $scope.editorOptions = editorOpts({height: 25, width: 20});
        this.processDescription = this.process.description;
    }

    updateProcessName() {
        if (this.readonly) {
            return;
        }
        this.processesAPI.updateProcess(this.projectId, this.process.id, {name: this.process.name})
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
        if (this.readonly) {
            return;
        }
        if (this.processDescription === this.process.description) {
            return;
        }

        if (this.process.description === null) {
            return;
        }

        this.processesAPI.updateProcess(this.projectId, this.process.id, {description: this.process.description}).then(
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
        onChange: '&',
        readonly: '@'
    }
});
