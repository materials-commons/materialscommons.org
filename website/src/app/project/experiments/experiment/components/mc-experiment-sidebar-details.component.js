angular.module('materialscommons').component('mcExperimentSidebarDetails', {
    templateUrl: 'app/project/experiments/experiment/components/mc-experiment-sidebar-details.html',
    controller: MCExperimentSidebarDetailsComponentController,
    bindings: {
        currentStep: '='
    }
});

/*@ngInject*/
function MCExperimentSidebarDetailsComponentController($scope) {
    let ctrl = this;

    ctrl.maximize = (step) => {
        ctrl.currentStep = step;
        ctrl.currentStep.displayState = true;
    };

    $scope.editorOptions = {
        height: '20vh',
        width: '25vw'
    };
}
