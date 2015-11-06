(function (module) {
    module.controller("SamplesController", SamplesController);
    SamplesController.$inject = ["$state", "project", "$filter", "samples", "processTemplates"];

    function SamplesController($state, project, $filter, samples, processTemplates) {
        var ctrl = this;

        ctrl.project = project;
        ctrl.viewSample = viewSample;
        ctrl.samples = samples;
        ctrl.createSample = createSample;

        if (ctrl.samples.length !== 0) {
            var sortedSamples = $filter('orderBy')(ctrl.samples, 'name');
            ctrl.current = sortedSamples[0];
            $state.go('projects.project.samples.list.edit', {sample_id: ctrl.current.id});
        }

        //////////////////

        function viewSample(sample) {
            ctrl.current = sample;
            $state.go('projects.project.samples.list.edit', {sample_id: ctrl.current.id});
        }

        function createSample() {
            var template = processTemplates.getTemplateByName('As Received');
            processTemplates.setActiveTemplate(template);
            $state.go('projects.project.processes.create');
        }
    }
}(angular.module('materialscommons')));