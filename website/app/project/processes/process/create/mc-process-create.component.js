(function(module) {
    module.component('mcProcessCreate', {
        templateUrl: 'app/project/processes/process/create/mc-process-create.html',
        controller: 'MCProcessCreateComponentController'
    });

    module.controller('MCProcessCreateComponentController', MCProcessCreateComponentController);
    MCProcessCreateComponentController.$inject = ['template'];
    function MCProcessCreateComponentController(template) {
        var ctrl = this;
        ctrl.template = template.get();
    }
}(angular.module('materialscommons')));
