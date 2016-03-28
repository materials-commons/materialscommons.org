angular.module('materialscommons').component('mcExperiment', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment.html',
    controller: MCExperimentComponentController
});

/*@ngInject*/
function MCExperimentComponentController($scope, templates, $filter, $mdDialog) {
    let ctrl = this;
    let last = 0;
    ctrl.addHeadings = true;
    ctrl.addProcesses = false;
    ctrl.currentStep = null;

    $scope.editorOptions = {
        height: '20vh',
        width: '25vw'
    };

    ctrl.heading = '';
    ctrl.toggleDetailHeader = toggleDetailHeader;
    ctrl.addHeading = addHeading;
    ctrl.expandAll = expandAll;
    ctrl.collapseAll = collapseAll;
    ctrl.newStep = newStep;
    ctrl.remove = remove;
    ctrl.toggle = toggle;
    ctrl.addTopStep = addTopStep;
    ctrl.getMatches = getMatches;
    ctrl.addProcess = addProcess;
    ctrl.newProcessEntry = newProcessEntry;
    ctrl.toggleSelected = toggleSelected;
    ctrl.selectedStep = null;
    ctrl.searchText = '';

    ctrl.items = [];
    for (var i = 0; i < 1000; i++) {
        ctrl.items.push(i);
    }

    ctrl.projectTemplates = templates.get();
    //console.dir(projectTemplates);

    ctrl.experiment = {
        name: '',
        goal: '',
        description: '',
        steps: []
    };

    /////////////////////////

    function expandAll() {
        $scope.$broadcast('angular-ui-tree:expand-all');
    }

    function collapseAll() {
        $scope.$broadcast('angular-ui-tree:collapse-all');
    }

    function createEmptyStep() {
        return {
            title: '',
            steps: [],
            edit: true,
            editDescription: false,
            description: '',
            notes: '',
            selected: false,
            flag: {
                important: false,
                review: false,
                error: false,
                done: false
            },
            details: {
                showTitle: true,
                showStatus: true,
                showNotes: true,
                showFiles: false,
                showSamples: false,
                currentFilesTab: 0,
                currentSamplesTab: 0
            }
        };
    }

    function newStep(node) {
        let nodeData = node.$modelValue;
        nodeData.steps.push(createEmptyStep());
        last++;
    }

    function addTopStep(title) {
        let experimentTitle = title ? title : '';
        let newStep = createEmptyStep();
        newStep.title = experimentTitle;
        ctrl.experiment.steps.push(newStep);
        ctrl.currentStep = newStep;
    }

    function addToSelected(title) {
        let experimentTitle = title ? title : '';
        let newStep = createEmptyStep();
        newStep.title = experimentTitle;
        ctrl.selectedStep.steps.push(newStep);
        ctrl.currentStep = newStep;
    }

    function remove(node) {
        if (node.$modelValue == ctrl.currentStep) {
            ctrl.currentStep = null;
        }
        console.dir(node);
        node.remove();
    }

    function toggle(node) {
        node.toggle();
    }

    function getMatches() {
        return $filter('filter')(ctrl.projectTemplates, ctrl.searchText);
    }

    function addProcess() {
        if (ctrl.selectedProcess) {
            if (ctrl.selectedStep) {
                addToSelected(ctrl.selectedProcess.name);
            } else {
                addTopStep(ctrl.selectedProcess.name);
            }
            ctrl.selectedProcess = undefined;
            ctrl.searchText = '';
        } else if (ctrl.searchText !== '') {
            // enter hit on a partial, they want to create a new entry
            newProcessEntry(ctrl.searchText);
        }
    }

    function addHeading() {
        if (!ctrl.heading) {
            return;
        }
        let newStep = createEmptyStep();
        newStep.title = ctrl.heading;
        if (ctrl.selectedStep) {
            ctrl.selectedStep.steps.push(newStep);
        } else {
            ctrl.experiment.steps.push(newStep);
        }
        ctrl.currentStep = newStep;
        ctrl.heading = '';
    }

    function newProcessEntry(processName) {
        console.log('newProcessEntry');
        ctrl.selectedProcess = undefined;
        ctrl.searchText = '';
        $mdDialog.show({
            template: `
                <md-dialog flex="40">
                    <md-toolbar layout="row">
                        <div layout-margin>
                            <h3>Create Process</h3>
                         </div>
                    </md-toolbar>
                    <md-dialog-content layout-margin>
                       <form layout="column" flex="40" style="margin-top:10px;">
                            <md-input-container md-no-float>
                                <label>Process name</label>
                                <input ng-model="ctrl.process.name" ng-disabled="true">
                            </md-input-container>
                            <md-input-container md-no-float>
                                <input type="text" ng-model="ctrl.process.description" placeholder="Description...">
                            </md-input-container>
                            <md-checkbox ng-model="ctrl.process.does_transform">
                                Process transforms inputs
                            </md-checkbox>
                       </form>
                    </md-dialog-content>
                    <md-dialog-actions layout="row" style="background-color:#e5e5e5">
                        <md-button class="md-primary" ng-click="ctrl.done()">done</md-button>
                        <md-button class="md-warn" ng-click="ctrl.cancel()">cancel</md-button>
                    </md-dialog-actions>
                </md-dialog>
                `,
            locals: {
                processName: processName
            },
            controller: CreateProcessDialogController,
            controllerAs: 'ctrl',
            bindToController: true,
            fullscreen: true
        }).then((p) => {
            ctrl.projectTemplates.push(p);
            addTopStep(p.name);
        });
    }

    function toggleSelected(step) {
        ctrl.currentStep = step;
        if (ctrl.selectedStep && ctrl.selectedStep === step) {
            step.selected = false;
            ctrl.selectedStep = null;
            return;
        }

        if (ctrl.selectedStep && ctrl.selectedStep !== step) {
            ctrl.selectedStep.selected = false;
        }
        step.selected = true;
        ctrl.selectedStep = step;
    }

    function toggleDetailHeader(header) {
        ctrl.currentStep.details[header] = !ctrl.currentStep.details[header];
    }
}

/*@ngInject*/
function CreateProcessDialogController($mdDialog) {
    let ctrl = this;
    ctrl.process = {
        name: ctrl.processName,
        description: '',
        does_transform: false
    };

    ctrl.done = () => $mdDialog.hide(ctrl.process);
    ctrl.cancel = () => $mdDialog.cancel();
}
