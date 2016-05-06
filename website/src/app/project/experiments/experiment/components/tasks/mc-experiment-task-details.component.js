angular.module('materialscommons').component('mcExperimentTaskDetails', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/mc-experiment-task-details.html',
    controller: MCExperimentTaskDetailsComponentController,
    bindings: {
        task: '='
    }
});

/*@ngInject*/
function MCExperimentTaskDetailsComponentController($scope, editorOpts, currentTask, templates,
                                                    template, experimentsService, $stateParams, toast) {
    let ctrl = this;
    ctrl.currentTask = currentTask.get();
    var t = templates.getTemplate('As Received');
    template.set(t);

    $scope.editorOptions = editorOpts({height: 25, width: 20});

    ctrl.selectedTemplate = (templateId, processId) => {
        console.log('selectedTemplate', templateId, processId);
    };

    ctrl.updateTaskNote = () => {
        console.log('updateTaskNote');
        if (ctrl.task.note === null) {
            ctrl.task.note = "";
        }

        experimentsService.updateTask($stateParams.project_id, $stateParams.experiment_id, ctrl.task.id,
            {note: ctrl.task.note})
            .then(
                () => null,
                () => toast.error('Unable to update task note.')
            );
    };
}
