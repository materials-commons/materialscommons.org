(function (module) {
    module.controller("SamplesController", SamplesController);
    SamplesController.$inject = ["$state", "$filter", "samples", "filterSample"];

    function SamplesController($state, $filter, samples, filterSample) {
        var ctrl = this;

        ctrl.viewSample = viewSample;
        ctrl.samples = samples;
        ctrl.createSample = createSample;
        ctrl.sampleFilter = sampleFilter;
        ctrl.filterBy = 'all';
        ctrl.showSamplesInGroups = false;
        ctrl.showGroupsChanged = showGroupsChanged;
        ctrl.showGroupsFilter = {
            is_grouped: false
        };

        if (ctrl.samples.length !== 0) {
            var sortedSamples = $filter('orderBy')(ctrl.samples, 'name');
            ctrl.current = sortedSamples[0];
            $state.go('projects.project.samples.list.edit', {sample_id: ctrl.current.id});
        }

        //////////////////

        function showGroupsChanged() {
            if (!ctrl.showSamplesInGroups) {
                ctrl.showGroupsFilter = {
                    is_grouped: false
                }
            } else {
                ctrl.showGroupsFilter = {};
            }
        }

        function viewSample(sample) {
            ctrl.current = sample;
            $state.go('projects.project.samples.list.edit', {sample_id: ctrl.current.id});
        }

        function createSample() {
            $state.go('projects.project.processes.create', {process: 'As Received', process_id: ''});
        }

        function sampleFilter(sample) {
            if (!ctrl.searchText || ctrl.searchText === '') {
                return true;
            }

            var searchTextLC = ctrl.searchText.toLowerCase();
            switch (ctrl.filterBy) {
            case 'all':
                return filterSample.byAll(sample, searchTextLC);
                break;
            case 'processes':
                return filterSample.byProcess(sample, searchTextLC);
                break;
            case 'samples':
                return filterSample.bySample(sample, searchTextLC);
                break;
            default:
                return filterSample.byAll(sample, searchTextLC);
                break;
            }
        }
    }
}(angular.module('materialscommons')));