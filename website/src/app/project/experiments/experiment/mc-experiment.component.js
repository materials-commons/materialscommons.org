import {Experiment, ExperimentStep} from './experiment.model';

angular.module('materialscommons').component('mcExperiment', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment.html',
    controller: MCExperimentComponentController
});

/*@ngInject*/
function MCExperimentComponentController($scope, moveStep, currentStep) {
    let ctrl = this;
    ctrl.currentNode = null;
    ctrl.showSidebar = false;

    // Create the initial hard coded experiment
    ctrl.experiment = new Experiment('test experiment');
    let s = new ExperimentStep('', '');
    s.id = "simple0";
    ctrl.experiment.steps.push(s);
    ctrl.currentStep = currentStep.set(s);
    ctrl.currentStep = currentStep.get();

    ctrl.editorOptions = {
        height: '20vh',
        width: '27vw'
    };

    ctrl.editorOptionsMaximized = {
        height: '55vh',
        width: '93vw'
    };

    ctrl.moveLeft = () => moveStep.left(ctrl.currentNode, currentStep.get(), ctrl.experiment);
    ctrl.moveRight = () => moveStep.right(ctrl.currentNode, currentStep.get());
    ctrl.moveUp = () => moveStep.up(ctrl.currentNode, currentStep.get());
    ctrl.moveDown = () => moveStep.down(ctrl.currentNode, currentStep.get(), ctrl.experiment);
    ctrl.expandAll = () => $scope.$broadcast('angular-ui-tree:expand-all');
    ctrl.collapseAll = () => $scope.$broadcast('angular-ui-tree:collapse-all');
    ctrl.showStepMaximized = () => currentStep.get().displayState.maximize;
    ctrl.openAll = openAll;
    ctrl.closeAll = closeAll;
    ctrl.getCurrentStep = () => currentStep.get();

    function openAll() {
        var treeModel = new TreeModel({childrenPropertyName: 'steps'}),
            root = treeModel.parse(ctrl.experiment);
        console.dir(root);
    }

    function closeAll() {

    }
}

