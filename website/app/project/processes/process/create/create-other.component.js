(function(module) {
    module.component('mcProcessCreateOther', {
        templateUrl: 'project/processes/process/create/create-other.html',
        controller: 'MCProcessCreateOtherComponentController'
    });

    module.controller('MCProcessCreateOtherComponentController', MCProcessCreateOtherComponentController);
    MCProcessCreateOtherComponentController.$inject = [
        'template', 'processSelections', 'prepareCreatedSample', 'createProcess', 'toastr', 'previousStateService',
        '$state'
    ];
    function MCProcessCreateOtherComponentController(template, processSelections,
                                                          prepareCreatedSample, createProcess,
                                                          toastr, previousStateService, $state) {

    }
}(angular.module('materialscommons')));
