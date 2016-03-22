angular.module('materialscommons').component('mcCreateExperiment', {
    templateUrl: 'app/project/experiments/experiment/create/mc-create-experiment.html',
    controller: MCCreateExperimentComponentController
});

function MCCreateExperimentComponentController($scope, templates, $filter) {
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

    let projectTemplates = templates.get();

    ctrl.experiment = {
        name: '',
        goal: '',
        description:'',
        steps: [
            {title: '', steps:[], edit: true, editDescription: false, description: ''}
        ]
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

    function addTopStep() {
        ctrl.experiment.steps.push({
            title: '',
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

    function getMatches(searchText) {
        return $filter('filter')(projectTemplates, searchText);
    }

    function addProcess() {
        console.log('I would add', ctrl.selectedProcess);
        ctrl.selectedProcess = '';
    }
}
