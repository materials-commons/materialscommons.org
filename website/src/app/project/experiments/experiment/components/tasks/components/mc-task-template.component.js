angular.module('materialscommons').component('mcTaskTemplate', {
    templateUrl: 'app/project/experiments/experiment/components/tasks/components/mc-task-template.html',
    controller: MCTaskTemplateComponentController,
    bindings: {
        task: '='
    }
});

/*@ngInject*/
function MCTaskTemplateComponentController() {
    var ctrl = this;
    //ctrl.template = template.get();
}