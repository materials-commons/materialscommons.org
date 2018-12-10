class MCWorkflowSidebarProcessDetailsComponentController {
    /*@ngInject*/
    constructor($scope, editorOpts) {
        $scope.editorOptions = editorOpts({height: 25, width: 20});
        this.state = {
            process: null,
            processName: '',
            processDescription: ''
        };
    }

    $onChanges(changes) {
        if (changes.process) {
            if (this.state.process && changes.process.currentValue.id !== this.state.process.id) {
                this.save();
            }
            this.state.process = angular.copy(changes.process.currentValue);
            this.state.processName = angular.copy(this.state.process.name);
            this.state.processDescription = angular.copy(this.state.process.description);
        }
    }

    save() {
        let changed = {},
            changesWereMade = false;
        if (this.state.processName !== this.state.process.name && this.state.processName !== '') {
            changesWereMade = true;
            changed.name = this.state.processName;
        }

        if (this.state.processDescription !== this.state.process.description && this.state.processDescription !== '') {
            changesWereMade = true;
            changed.description = this.state.processDescription;
        }

        if (changesWereMade) {
            this.onUpdateProcess({processId: this.state.process.id, attrs: changed});
        }
    }
}

angular.module('materialscommons').component('mcWorkflowSidebarProcessDetails', {
    controller: MCWorkflowSidebarProcessDetailsComponentController,
    template: require('./workflow-sidebar-process-details.html'),
    bindings: {
        process: '<',
        onUpdateProcess: '&'
    }
});