angular.module('materialscommons').component('mcProcessCreate', {
    templateUrl: 'app/project/processes/process/create/mc-process-create.html',
    controller: MCProcessCreateComponentController
});

function MCProcessCreateComponentController(template) {
    'ngInject';

    var ctrl = this;
    ctrl.template = template.get();
}