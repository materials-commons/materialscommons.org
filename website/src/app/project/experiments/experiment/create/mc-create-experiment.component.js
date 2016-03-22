angular.module('materialscommons').component('mcCreateExperiment', {
    templateUrl: 'app/project/experiments/experiment/create/mc-create-experiment.html',
    controller: MCCreateExperimentComponentController
});

/*@ngInject*/
function MCCreateExperimentComponentController($scope, templates, $filter, $mdDialog) {
    console.log('mcCreateExperiment');
    let ctrl = this;
    let last = 0;
    ctrl.expandAll = expandAll;
    ctrl.collapseAll = collapseAll;
    ctrl.newStep = newStep;
    ctrl.remove = remove;
    ctrl.toggle = toggle;
    ctrl.addTopStep = addTopStep;
    ctrl.getMatches = getMatches;
    ctrl.addProcess = addProcess;
    ctrl.newProcessEntry = newProcessEntry;
    ctrl.searchText= '';

    ctrl.projectTemplates = templates.get();
    //console.dir(projectTemplates);

    ctrl.experiment = {
        name: '',
        goal: '',
        description:'',
        steps: []
    };

    /////////////////////////

    function expandAll() {
        $scope.$broadcast('angular-ui-tree:expand-all');
    }

    function collapseAll() {
        $scope.$broadcast('angular-ui-tree:collapse-all');
    }

    function newStep(node) {
        let nodeData = node.$modelValue;
        nodeData.steps.push({
            title: '',
            steps: [],
            edit: true,
            editDescription: false,
            description: ''
        });
        last++;
    }

    function addTopStep(title) {
        let experimentTitle = title ? title : '';
        ctrl.experiment.steps.push({
            title: experimentTitle,
            steps: [],
            edit: true,
            editDescription: false,
            description: ''
        });
    }

    function remove(node) {
        node.remove();
    }

    function toggle(node) {
        node.toggle();
    }

    function getMatches() {
        //console.dir(ctrl.projectTemplates);
        console.log(ctrl.projectTemplates.length);
        let v = $filter('filter')(ctrl.projectTemplates, ctrl.searchText);
        console.log('v is', v);
        return v;
    }

    function addProcess() {
        if (ctrl.selectedProcess) {
            console.log('I would add', ctrl.selectedProcess);
            addTopStep(ctrl.selectedProcess.name);
            ctrl.selectedProcess = undefined;
            ctrl.searchText = '';
        } else if (ctrl.searchText !== '') {
            // enter hit on a partial, they want to create a new entry
            newProcessEntry(ctrl.searchText);
        }
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
            console.log('I would create a new process type', p);
            ctrl.projectTemplates.push(p);
            console.dir(ctrl.projectTemplates);
            addTopStep(p.name);
        });
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
