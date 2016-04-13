angular.module('materialscommons').component('mcExperimentTasks', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/mc-experiment-tasks.html',
    controller: MCExperimentTasksComponentController,
    bindings: {
        experiment: '='
    }
});

/*@ngInject*/
function MCExperimentTasksComponentController($scope, moveStep, currentStep) {
    let ctrl = this;

    ctrl.$onInit = () => {
        ctrl.currentNode = null;
        ctrl.experiment.steps[0].displayState.selectedClass = 'step-selected';
        currentStep.set(ctrl.experiment.steps[0]);
        ctrl.currentStep = currentStep.get();
    };

    ctrl.moveLeft = () => moveStep.left(ctrl.currentNode, currentStep.get(), ctrl.experiment);
    ctrl.moveRight = () => moveStep.right(ctrl.currentNode, currentStep.get());
    ctrl.moveUp = () => moveStep.up(ctrl.currentNode, currentStep.get());
    ctrl.moveDown = () => moveStep.down(ctrl.currentNode, currentStep.get(), ctrl.experiment);
    ctrl.expandAll = () => $scope.$broadcast('angular-ui-tree:expand-all');
    ctrl.collapseAll = () => $scope.$broadcast('angular-ui-tree:collapse-all');
    ctrl.showStepMaximized = () => {
        if (!currentStep.get()) {
            return false;
        }
        return currentStep.get().displayState.maximize;
    };
    ctrl.openAll = openAll;
    ctrl.closeAll = closeAll;
    ctrl.getCurrentStep = () => currentStep.get();

    function openAll() {
        var treeModel = new TreeModel({childrenPropertyName: 'steps'}),
            root = treeModel.parse(ctrl.experiment);
        //ctrl.experiment.steps.forEach((step) => step.displayState.open = true);
    }

    function closeAll() {
        //ctrl.experiment.steps.forEach((step) => step.displayState.open = false);
    }
}

