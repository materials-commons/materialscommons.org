angular.module('materialscommons').component('mcExperimentDetails', {
    templateUrl: 'app/project/experiments/experiment/components/mc-experiment-details.html',
    controller: MCExperimentDetailsComponentController,
    bindings: {
        step: '=',
        editorOptions: '<',
        compactSize: '<'
    }
});

function MCExperimentDetailsComponentController($scope, currentStep) {
    let ctrl = this;
    ctrl.currentStep = currentStep.get();
    $scope.editorOptions = ctrl.editorOptions;
    ctrl.maximize = () => {
        ctrl.currentStep = ctrl.step;
        ctrl.currentStep.displayState.maximize = true;
    }
}
