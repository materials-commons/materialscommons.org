class MCWworkflowFiltersByProcessesComponentController {
    /*@ngInject*/
    constructor(experimentsAPI, processTree, mcbus, $stateParams) {
        this.experimentsAPI = experimentsAPI;
        this.processTree = processTree;
        this.mcbus = mcbus;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.allExpanded = true;
    }

    $onInit() {
        this.experimentsAPI.getProcessesForExperiment(this.projectId, this.experimentId).then(
            (processes) => {
                let t = this.processTree.build(processes, []);
                this.root = t.root;
                this.rootNode = t.rootNode;
            }
        )
    }

    applyFilter() {
        let selected = this.processTree.getSelected(this.root);
        if (selected.length) {
            this.mcbus.send('WORKFLOW$HIDEOTHERS', selected);
        }
    }

    clearFilter() {
        this.processTree.clearSelected(this.root);
        this.mcbus.send('WORKFLOW$RESTOREHIDDEN');
    }

    collapseExpandAll() {
        this.allExpanded = !this.allExpanded;
        this.root.walk(node => {
            node.model.show = this.allExpanded;
        });
    }
}

class MCWorkflowFiltersByProcessesDirDirectiveController {
    /*@ngInject*/
    constructor() {

    }
}

/*@ngInject*/
function mcWorkflowFiltersByProcessesDirDirective(RecursionHelper) {
    return {
        restrict: 'E',
        scope: {
            process: '='
        },
        controller: MCWorkflowFiltersByProcessesDirDirectiveController,
        controllerAs: '$ctrl',
        bindToController: true,
        template: `
        <ul>
            <li ng-repeat="node in $ctrl.process.children" layout="column">
                <div>
                    <input type="checkbox" ng-model="node.model.selected">
                    <span>
                        <a ng-if="node.children.length"
                           ng-click="node.model.show = !node.model.show">
                            <i class="primary-color fa fa-fw"
                               ng-class="{'fa-chevron-right': !node.model.show, 'fa-chevron-down': node.model.show}"></i>
                        </a>
                        {{::node.model.name}}
                    </span>
                </div>
                <mc-workflow-filters-by-processes-dir process="node"></mc-workflow-filters-by-processes-dir>
            </li>      
        </ul>
        `,
        compile: function(element) {
            return RecursionHelper.compile(element, function() {
            });
        }
    };
}

angular.module('materialscommons').directive('mcWorkflowFiltersByProcessesDir', mcWorkflowFiltersByProcessesDirDirective);

angular.module('materialscommons').component('mcWorkflowFiltersByProcesses', {
    template: `
    <div layout="row">
        <md-button ng-click="$ctrl.applyFilter()" class="md-primary">Apply Filter</md-button>
        <md-button ng-click="$ctrl.clearFilter()" class="md-primary">Clear Filter</md-button>
    </div>
    <md-button ng-click="$ctrl.collapseExpandAll()">Collapse/Expand All</md-button>
    <ul>
        <li ng-repeat="node in $ctrl.rootNode.children" layout="column">
            <div>
                <input type="checkbox" ng-model="node.model.selected">
                <span>
                    <a ng-if="node.children.length"
                       ng-click="node.model.show = !node.model.show">
                        <i class="primary-color fa fa-fw"
                           ng-class="{'fa-chevron-right': !node.model.show, 'fa-chevron-down': node.model.show}"></i>
                    </a>
                    {{::node.model.name}}
                </span>
            </div>
            <mc-workflow-filters-by-processes-dir process="node" ng-if="node.model.show"></mc-workflow-filters-by-processes-dir>
        </li>      
    </ul>
    `,
    controller: MCWworkflowFiltersByProcessesComponentController
});
