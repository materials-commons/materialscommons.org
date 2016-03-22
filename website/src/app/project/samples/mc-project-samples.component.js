angular.module('materialscommons').component('mcProjectSamples', {
    templateUrl: 'app/project/samples/mc-project-samples.html',
    controller: MCProjectSamplesComponentController,
    bindings: {
        samples: '='
    }
});

/*@ngInject*/
function MCProjectSamplesComponentController($mdDialog, $stateParams) {
    var ctrl = this;
    ctrl.searchText = '';
    ctrl.showSamplesInGroups = false;
    ctrl.showSample = showSample;
    ctrl.showProcesses = showProcesses;
    ctrl.showSample2 = showSample2;
    ctrl.sample = null;
    ctrl.projectId = $stateParams.project_id;
    ctrl.sidebarOpen = false;
    ctrl.sortOrder = 'name';

    ctrl.showGroupsChanged = showGroupsChanged;
    ctrl.showGroupsFilter = {
        is_grouped: false
    };

    ///////////////////////////

    function showGroupsChanged() {
        if (!ctrl.showSamplesInGroups) {
            ctrl.showGroupsFilter = {
                is_grouped: false
            }
        } else {
            ctrl.showGroupsFilter = {};
        }
    }

    function showSample2(sample) {
        if (!ctrl.sample) {
            ctrl.sample = sample;
            ctrl.sidebarOpen = true;
        } else if (sample.id === ctrl.sample.id) {
            ctrl.sidebarOpen = !ctrl.sidebarOpen;
        } else {
            ctrl.sample = sample;
            ctrl.sidebarOpen = true;
        }
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
        })
    }

    function showProcesses(processes) {
        console.dir(processes);
        $mdDialog.show({
            template: `
                <md-button class="md-warn" ng-click="ctrl.closeDialog()">close</md-button>
                <md-list>
                    <md-list-item ng-repeat="process in ctrl.processes">
                        {{process.name}}
                    </md-list-item>
                </md-list>`,
            locals: {
                processes: processes
            },
            controller: ShowProcessesDialogController,
            controllerAs: 'ctrl',
            bindToController: true,
            fullscreen: true
        })
    }
}

/*@ngInject*/
function ShowProcessesDialogController($mdDialog) {
    var ctrl = this;
    console.dir(ctrl.processes);
    ctrl.closeDialog = function() {
        $mdDialog.hide();
    }
}

/*@ngInject*/
function ShowSampleDialogController($stateParams) {
    var ctrl = this;
    ctrl.projectId = $stateParams.project_id;
    console.log('ShowSampleDialogController', ctrl.projectId, ctrl.sampleId);
}