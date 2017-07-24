angular.module('materialscommons').component('mcProcessesAutocomplete', {
    templateUrl: 'app/project/experiments/experiment/components/mc-processes-autocomplete.html',
    controller: MCProcessesAutocompleteComponentController,
    bindings: {}
});

/*@ngInject*/
function MCProcessesAutocompleteComponentController(templates, $filter, $mdDialog) {
    let ctrl = this;
    ctrl.searchText = '';

    ctrl.getMatches = getMatches;
    ctrl.newProcessEntry = newProcessEntry;
    ctrl.projectTemplates = templates.get();

    function getMatches() {
        return $filter('filter')(ctrl.projectTemplates, ctrl.searchText);
    }

    function newProcessEntry(processName) {
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

