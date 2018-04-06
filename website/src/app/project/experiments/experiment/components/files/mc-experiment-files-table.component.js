angular.module('materialscommons').component('mcExperimentFilesTable', {
    template: require('./mc-experiment-files-table.html'),
    controller: MCExperimentFilesTableComponentController,
    bindings: {
        files: '<',
        filterBy: '='
    }
});

/*@ngInject*/
function MCExperimentFilesTableComponentController($mdDialog, mcfile, isImage) {
    var ctrl = this;
    ctrl.showFile = showFile;
    ctrl.showProcesses = showProcesses;
    ctrl.showExperiments = showExperiments;
    ctrl.showSample = showSample;
    ctrl.sortOrder = "name";
    ctrl.fileSrc = mcfile.src;
    ctrl.isImage = isImage;

    function showFile() {
    // function showFile(file) { // when log statement commented out - file defined and not used
        // log('showFile', file);
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
