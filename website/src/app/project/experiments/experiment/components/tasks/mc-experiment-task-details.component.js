angular.module('materialscommons').component('mcExperimentTaskDetails', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/mc-experiment-task-details.html',
    controller: MCExperimentTaskDetailsComponentController,
    bindings: {
        task: '='
    }
});

/*@ngInject*/
function MCExperimentTaskDetailsComponentController($scope, editorOpts, currentTask, templates, template) {
    let ctrl = this;
    ctrl.currentTask = currentTask.get();
    var t = templates.getTemplate('As Received');
    template.set(t);

    $scope.editorOptions = editorOpts({height: 25, width: 20});

    ctrl.selectedTemplate = (templateId, processId) => {
        console.log('selectedTemplate', templateId, processId);
    };
}
