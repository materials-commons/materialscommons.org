angular.module('materialscommons').component('mcProcessCreate', {
    templateUrl: 'app/project/processes/process/create/mc-process-create.html',
    controller: MCProcessCreateComponentController,
    bindings: {
        template: '='
    }
});

function MCProcessCreateComponentController() {
    'ngInject';
    var ctrl = this;  // eslint-disable-line no-unused-vars
    //console.dir(ctrl.template);
    //ctrl.template = template.get();
}
