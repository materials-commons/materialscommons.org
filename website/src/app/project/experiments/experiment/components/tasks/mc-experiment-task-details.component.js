angular.module('materialscommons').component('mcExperimentTaskDetails', {
    template: require('./mc-experiment-task-details.html'),
    controller: MCExperimentTaskDetailsComponentController,
    bindings: {
        task: '<'
    }
});

/*@ngInject*/
function MCExperimentTaskDetailsComponentController($scope, editorOpts, $stateParams, toast, projectsAPI, taskService) {
    let ctrl = this;

    $scope.editorOptions = editorOpts({height: 25, width: 20});

    ctrl.$onInit = () => {
        if (!ctrl.task.loaded && ctrl.task.process_id !== '') {
            projectsAPI.getProjectProcess($stateParams.project_id, ctrl.task.process_id)
                .then(
                    (process) => {
                        ctrl.task.template = process;
                        ctrl.task.template.template_name = process.process_name ? process.process_name : process.template_id.substring(7);
                        ctrl.task.loaded = true;
                    },
                    () => toast.error('Unable to retrieve task template')
                );
        }
    };

    ctrl.selectedTemplate = (templateId, processId) => taskService.setTemplate(templateId, processId, ctrl.task);

    ctrl.updateTaskNote = () => taskService.updateNote(ctrl.task);
}
