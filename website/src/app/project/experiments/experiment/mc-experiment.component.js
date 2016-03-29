import {Experiment, ExperimentStep} from './experiment';

angular.module('materialscommons').component('mcExperiment', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment.html',
    controller: MCExperimentComponentController
});

/*@ngInject*/
function MCExperimentComponentController($scope, templates, $filter, $mdDialog, moveStep) {
    let ctrl = this;
    ctrl.addHeadings = true;
    ctrl.addProcesses = false;
    ctrl.currentStep = null;

    $scope.editorOptions = {
        height: '20vh',
        width: '25vw'
    };

    ctrl.heading = '';
    ctrl.toggleDetailHeader = toggleDetailHeader;
    ctrl.expandAll = expandAll;
    ctrl.collapseAll = collapseAll;
    ctrl.getMatches = getMatches;
    ctrl.newProcessEntry = newProcessEntry;
    ctrl.searchText = '';
    ctrl.currentNode = null;

    ctrl.projectTemplates = templates.get();
    //console.dir(projectTemplates);

    ctrl.experiment = new Experiment('test experiment');
    let s = new ExperimentStep('', '');
    s.id = "simple0";
    ctrl.experiment.steps.push(s);
    ctrl.currentStep = s;

    ctrl.moveLeft = () => moveStep.left(ctrl.currentNode, ctrl.currentStep, ctrl.experiment);
    ctrl.moveRight = () => moveStep.right(ctrl.currentNode, ctrl.currentStep);
    ctrl.moveUp = () => moveStep.up(ctrl.currentNode, ctrl.currentStep);
    ctrl.moveDown = () => moveStep.down(ctrl.currentNode, ctrl.currentStep, ctrl.experiment);

    /////////////////////////

    function expandAll() {
        $scope.$broadcast('angular-ui-tree:expand-all');
    }

    function collapseAll() {
        $scope.$broadcast('angular-ui-tree:collapse-all');
    }

    function getMatches() {
        return $filter('filter')(ctrl.projectTemplates, ctrl.searchText);
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
