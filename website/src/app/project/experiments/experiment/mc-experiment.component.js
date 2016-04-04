import {Experiment, ExperimentStep} from './experiment.model';

angular.module('materialscommons').component('mcExperiment', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment.html',
    controller: MCExperimentComponentController
});

/*@ngInject*/
function MCExperimentComponentController($scope, $stateParams, moveStep, currentStep, experimentsService) {
    let ctrl = this;
    ctrl.currentNode = null;
    ctrl.showSidebar = false;

    experimentsService.getForProject($stateParams.project_id, $stateParams.experiment_id).then(
        (e) => {
            ctrl.experiment = e;
            if (!ctrl.experiment.steps.length) {
                let s = new ExperimentStep('My first step', '');
                s.id = "simple0";
                ctrl.experiment.steps.push(s);
                currentStep.set(s);
                ctrl.currentStep = currentStep.get();
            } else {
                currentStep.set(ctrl.experiment.steps[0]);
                ctrl.currentStep = currentStep.get();
            }
        },
        (error) => console.log('error', error)
    );

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
        console.dir(root);
    }

    function closeAll() {

    }
}

