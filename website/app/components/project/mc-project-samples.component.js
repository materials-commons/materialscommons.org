(function (module) {
    module.component('mcProjectSamples', {
        templateUrl: 'components/project/mc-project-samples.html',
        controller: 'MCProjectSamplesComponentController',
        bindings: {
            samples: '='
        }
    });

    module.controller('MCProjectSamplesComponentController', MCProjectSamplesComponentController);
    MCProjectSamplesComponentController.$inject = ["$state"];
    function MCProjectSamplesComponentController($state) {
        var ctrl = this;
        ctrl.chooseSample = chooseSample;

        ///////////////////////////

        function chooseSample(sample) {
            $state.go('project.sample', {sample_id: sample.id});
        }
    }
}(angular.module('materialscommons')));
