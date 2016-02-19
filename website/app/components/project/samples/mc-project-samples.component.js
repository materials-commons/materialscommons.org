(function (module) {
    module.component('mcProjectSamples', {
        templateUrl: 'components/project/samples/mc-project-samples.html',
        controller: 'MCProjectSamplesComponentController'
    });

    module.controller('MCProjectSamplesComponentController', MCProjectSamplesComponentController);
    MCProjectSamplesComponentController.$inject = ["$state", "project"];
    function MCProjectSamplesComponentController($state, project) {
        var ctrl = this;
        ctrl.chooseSample = chooseSample;
        ctrl.samples = project.get().samples;

        ///////////////////////////

        function chooseSample(sample) {
            $state.go('project.samples.sample', {sample_id: sample.id});
        }
    }
}(angular.module('materialscommons')));
