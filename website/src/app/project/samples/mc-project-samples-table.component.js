angular.module('materialscommons').component('mcProjectSamplesTable', {
    templateUrl: 'app/project/samples/mc-project-samples-table.html',
    controller: MCProjectSamplesTableComponentController,
    bindings: {
        samples: '<',
        filterBy: '='
    }
});

/*@ngInject*/
function MCProjectSamplesTableComponentController($mdDialog) {
    var ctrl = this;
    ctrl.showFiles = showFiles;
    ctrl.showProcesses = showProcesses;
    ctrl.showExperiments = showExperiments;
    ctrl.showSample = showSample;
    ctrl.sortOrder = "name";

    function showFiles() {

    }

    function showProcesses(processes) {
        $mdDialog.show({
            template: `
                <md-dialog>
                    <md-dialog-content>
                        <md-button class="md-warn" ng-click="ctrl.closeDialog()">close</md-button>
                        <md-list>
                            <md-list-item ng-repeat="process in ctrl.processes">
                                {{process.name}}
                            </md-list-item>
                        </md-list>
                    </md-dialog-content>
                </md-dialog>
                `,
            locals: {
                processes: processes
            },
            controller: ShowProcessesDialogController,
            controllerAs: 'ctrl',
            bindToController: true,
            fullscreen: true
        });
    }

    function showExperiments() {

    }

    function showSample(sample) {
        let parentEl = angular.element(document.body);
        $mdDialog.show({
            openFrom: parentEl,
            template: `
                <md-dialog flex="60">
                    <md-dialog-content>
                        <mc-sample project-id="ctrl.projectId" sample-id="ctrl.sampleId"></mc-sample>
                    </md-dialog-content>
                </md-dialog>
                `,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            locals: {
                sampleId: sample.id
            },
            controller: ShowSampleDialogController,
            controllerAs: 'ctrl',
            bindToController: true
        });
    }
}

/*@ngInject*/
function ShowProcessesDialogController($mdDialog) {
    var ctrl = this;
    ctrl.closeDialog = function() {
        $mdDialog.hide();
    }
}

/*@ngInject*/
function ShowSampleDialogController($stateParams) {
    var ctrl = this;
    ctrl.projectId = $stateParams.project_id;
}
