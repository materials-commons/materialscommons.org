import {Experiment, ExperimentStep} from './experiment.model';

angular.module('materialscommons').component('mcExperiment', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment.html',
    controller: MCExperimentComponentController
});

/*@ngInject*/
function MCExperimentComponentController($scope, moveStep) {
    let ctrl = this;
    ctrl.currentStep = null;
    ctrl.currentNode = null;
    ctrl.showSidebar = true;

    // Create the initial hard coded experiment
    ctrl.experiment = new Experiment('test experiment');
    let s = new ExperimentStep('', '');
    s.id = "simple0";
    ctrl.experiment.steps.push(s);
    ctrl.currentStep = s;

    ctrl.moveLeft = () => moveStep.left(ctrl.currentNode, ctrl.currentStep, ctrl.experiment);
    ctrl.moveRight = () => moveStep.right(ctrl.currentNode, ctrl.currentStep);
    ctrl.moveUp = () => moveStep.up(ctrl.currentNode, ctrl.currentStep);
    ctrl.moveDown = () => moveStep.down(ctrl.currentNode, ctrl.currentStep, ctrl.experiment);
    ctrl.expandAll = () => $scope.$broadcast('angular-ui-tree:expand-all');
    ctrl.collapseAll = () => $scope.$broadcast('angular-ui-tree:collapse-all');
    ctrl.showStepMaximized = () => ctrl.currentStep && ctrl.currentStep.displayState.maximize;
}

