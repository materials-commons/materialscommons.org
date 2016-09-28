angular.module('materialscommons').component('mcProcessCreate', {
    templateUrl: 'app/project/processes/process/create/mc-process-create.html',
    controller: MCProcessCreateComponentController,
    bindings: {
        template: '='
    }
});

function MCProcessCreateComponentController() {
    'ngInject';
    var ctrl = this;
    console.dir(ctrl.template);
    //ctrl.template = template.get();
}