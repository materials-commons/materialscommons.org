angular.module('materialscommons').component('mcExperimentTaskDetails', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/mc-experiment-task-details.html',
    controller: MCExperimentTaskDetailsComponentController,
    bindings: {
        step: '=',
        editorOptions: '<',
        compactSize: '<'
    }
});

/*@ngInject*/
function MCExperimentTaskDetailsComponentController($scope, currentStep, $stateParams, experimentsService, toast) {
    let ctrl = this;
    ctrl.currentStep = currentStep.get();
    ctrl.noNotes = 'No notes';
    $scope.editorOptions = ctrl.editorOptions;
    let experimentID = $stateParams.experiment_id;
    let projectID = $stateParams.project_id;

    ctrl.maximize = () => {
        ctrl.currentStep = ctrl.step;
        ctrl.currentStep.displayState.maximize = true;
    };

    ctrl.updateNotes = () => {
        // Handle case where the editor is activating even though its in an ng-if.
        if (!ctrl.step.displayState.open) {
            return;
        } else if (!experimentID || !projectID) {
            console.log('experimentID or projectID not defined');
            return;
        }

        if (!ctrl.step.notes) {
            ctrl.step.notes = '';
        }

        experimentsService
            .updateStep(projectID, experimentID, ctrl.step.id, {notes: ctrl.step.notes})
            .then(
                () => null,
                () => toast.error('Failed to update notes')
            );
    };
}
