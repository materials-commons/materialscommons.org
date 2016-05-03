angular.module('materialscommons').component('mcExperimentTaskDetails', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/mc-experiment-task-details.html',
    controller: MCExperimentTaskDetailsComponentController,
    bindings: {
        task: '='
    }
});

/*@ngInject*/
function MCExperimentTaskDetailsComponentController(currentTask, templates, template) {
    let ctrl = this;
    ctrl.currentTask = currentTask.get();
    var t = templates.getTemplate('As Received');
    console.dir(t);
    template.set(t);
}
