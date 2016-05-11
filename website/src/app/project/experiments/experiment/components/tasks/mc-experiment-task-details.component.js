angular.module('materialscommons').component('mcExperimentTaskDetails', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/mc-experiment-task-details.html',
    controller: MCExperimentTaskDetailsComponentController,
    bindings: {
        task: '='
    }
});

/*@ngInject*/
function MCExperimentTaskDetailsComponentController($scope, editorOpts, templates, experimentsService,
                                                    $stateParams, toast) {
    let ctrl = this;

    $scope.editorOptions = editorOpts({height: 25, width: 20});

    ctrl.selectedTemplate = (templateId, processId) => {
        console.log('selectedTemplate', templateId, processId);
        experimentsService.addTemplateToTask($stateParams.project_id, $stateParams.experiment_id,
            ctrl.task.id, `global_${templateId}`)
            .then(
                () => ctrl.task.template = templates.getTemplate(templateId),
                () => toast.error('Unable to associate template with task')
            );
    };

    ctrl.updateTaskNote = () => {
        if (ctrl.task.note === null) {
            return;
        }

        experimentsService.updateTask($stateParams.project_id, $stateParams.experiment_id, ctrl.task.id,
            {note: ctrl.task.note})
            .then(
                () => null,
                () => toast.error('Unable to update task note.')
            );
    };
}
