angular.module('materialscommons').component('mcExperimentTaskDetails', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/mc-experiment-task-details.html',
    controller: MCExperimentTaskDetailsComponentController,
    bindings: {
        task: '='
    }
});

/*@ngInject*/
function MCExperimentTaskDetailsComponentController($scope, editorOpts, templates, $stateParams, toast, projectsService,
                                                    processEdit, taskService) {
    let ctrl = this;

    $scope.editorOptions = editorOpts({height: 25, width: 20});

    ctrl.$onInit = () => {
        if (!ctrl.task.loaded && ctrl.task.process_id !== '') {
            projectsService.getProjectProcess($stateParams.project_id, ctrl.task.process_id)
                .then(
                    (process) => {
                        let templateName = process.process_name ? process.process_name : process.template_id.substring(7);
                        var t = templates.getTemplate(templateName);
                        ctrl.task.template = processEdit.fillProcess(t, process);
                        ctrl.task.template.template_name = templateName;
                        ctrl.task.loaded = true;
                    },
                    () => toast.error('Unable to retrieve task template')
                );
        }
    };

    ctrl.selectedTemplate = (templateId, processId) => taskService.setTemplate(templateId, processId, ctrl.task);

    ctrl.updateTaskNote = () => taskService.updateNote(ctrl.task);
}
