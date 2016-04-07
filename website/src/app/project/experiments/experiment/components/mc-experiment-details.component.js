angular.module('materialscommons').component('mcExperimentDetails', {
    templateUrl: 'app/project/experiments/experiment/components/mc-experiment-details.html',
    controller: MCExperimentDetailsComponentController,
    bindings: {
        step: '=',
        editorOptions: '<',
        compactSize: '<'
    }
});

/*@ngInject*/
function MCExperimentDetailsComponentController($scope, currentStep, $stateParams, experimentsService, toast) {
    let ctrl = this;
    ctrl.currentStep = currentStep.get();
    $scope.editorOptions = ctrl.editorOptions;

    ctrl.maximize = () => {
        ctrl.currentStep = ctrl.step;
        ctrl.currentStep.displayState.maximize = true;
    };

    ctrl.updateNotes = () => {
        // Handle case where the editor is activating even though its in an ng-if.
        if (!ctrl.step.displayState.open) {
            return;
        }

        if (!ctrl.step.notes) {
            ctrl.step.notes = '';
        }
        experimentsService
            .updateStep($stateParams.project_id, $stateParams.experiment_id, ctrl.step.id, {notes: ctrl.step.notes})
            .then(
                () => null,
                () => toast.error('Failed to update step')
            );
    };
}
