angular.module('materialscommons').component('mcExperimentTaskDetails', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/mc-experiment-task-details.html',
    controller: MCExperimentTaskDetailsComponentController,
    bindings: {
        task: '='
    }
});

/*@ngInject*/
function MCExperimentTaskDetailsComponentController($scope, editorOpts, templates, experimentsService,
                                                    $stateParams, toast, projectsService, processEdit) {
    let ctrl = this;

    $scope.editorOptions = editorOpts({height: 25, width: 20});

    ctrl.$onInit = () => {
        if (!ctrl.task.loaded && ctrl.task.process_id !== '') {
            console.log('I would load task template for process ', ctrl.task.process_id);
            projectsService.getProjectProcess($stateParams.project_id, ctrl.task.process_id)
                .then(
                    (process) => {
                        let templateName = process.process_name ? process.process_name : process.template_id.substring(7);
                        console.log(`templateName: '${templateName}'`);
                        var t = templates.getTemplate(templateName);
                        ctrl.task.template = processEdit.fillProcess(t, process);
                        ctrl.task.template.template_name = templateName;
                        ctrl.task.loaded = true;
                    },
                    () => toast.error('Unable to retrieve task template')
                );
        }
    };

    ctrl.selectedTemplate = (templateId, processId) => {
        console.log('selectedTemplate', templateId, processId);
        experimentsService.addTemplateToTask($stateParams.project_id, $stateParams.experiment_id,
            ctrl.task.id, `global_${templateId}`)
            .then(
                () => {
                    ctrl.task.template_name = templateId;
                    ctrl.task.template = templates.getTemplate(templateId);
                },
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
