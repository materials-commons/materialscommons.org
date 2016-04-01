angular.module('materialscommons').component('mcExperimentStepDetails', {
    templateUrl: 'app/project/experiments/experiment/components/mc-experiment-step-details.html',
    controller: MCExperimentStepDetailsComponentController,
    bindings: {
        step: '=',
        currentStep: '='
    }
});

function MCExperimentStepDetailsComponentController($scope) {
    $scope.editorOptions = {
        height: '55vh',
        width: '93vw'
    };
}
