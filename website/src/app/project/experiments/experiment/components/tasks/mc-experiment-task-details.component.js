angular.module('materialscommons').component('mcExperimentTaskDetails', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/mc-experiment-task-details.html',
    controller: MCExperimentTaskDetailsComponentController,
    bindings: {
        task: '=',
        editorOptions: '<',
        compactSize: '<'
    }
});

/*@ngInject*/
function MCExperimentTaskDetailsComponentController($scope, currentTask, $stateParams, experimentsService, toast) {
    let ctrl = this;
    ctrl.currentTask = currentTask.get();
    ctrl.noNotes = 'No notes';
    $scope.editorOptions = ctrl.editorOptions;
    let experimentID = $stateParams.experiment_id;
    let projectID = $stateParams.project_id;

    ctrl.maximize = () => {
        ctrl.currentTask = ctrl.task;
        ctrl.currentTask.displayState.maximize = true;
    };

    ctrl.updateNotes = () => {
        // Handle case where the editor is activating even though its in an ng-if.
        if (!ctrl.task.displayState.open) {
            return;
        } else if (!experimentID || !projectID) {
            console.log('experimentID or projectID not defined');
            return;
        }

        if (!ctrl.task.notes) {
            ctrl.task.notes = '';
        }

        experimentsService
            .updateTask(projectID, experimentID, ctrl.task.id, {notes: ctrl.task.notes})
            .then(
                () => null,
                () => toast.error('Failed to update notes')
            );
    };
}
