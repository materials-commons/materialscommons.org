(function(module) {
    module.component('mcProcessCreateAsReceived', {
        templateUrl: 'components/process/create/create-as-received.html',
        controller: 'MCProcessCreateAsReceivedComponentController'
    });

    module.controller('MCProcessCreateAsReceivedComponentController', MCProcessCreateAsReceivedComponentController);
    MCProcessCreateAsReceivedComponentController.$inject = ['template'];
    function MCProcessCreateAsReceivedComponentController(template) {
        console.log('MCProcessCreateAsReceivedComponentController');
        var ctrl = this;
        ctrl.process = template.get();
        ctrl.sample = {
            name: '',
            description: '',
            old_properties: [],
            new_properties: [],
            files: []
        };

        ctrl.sampleGroup = false;
        ctrl.sampleGroupSizing = 'set-size';
        ctrl.sampleGroupSize = 10;
    }
}(angular.module('materialscommons')));
