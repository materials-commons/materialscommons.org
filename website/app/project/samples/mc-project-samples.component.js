(function (module) {
    module.component('mcProjectSamples', {
        templateUrl: 'app/project/samples/mc-project-samples.html',
        controller: 'MCProjectSamplesComponentController'
    });

    module.controller('MCProjectSamplesComponentController', MCProjectSamplesComponentController);
    MCProjectSamplesComponentController.$inject = ["project"];
    function MCProjectSamplesComponentController(project) {
        var ctrl = this;
        ctrl.samples = project.get().samples;
        ctrl.searchText = '';
        ctrl.showSamplesInGroups = false;

        ctrl.showGroupsChangede = showGroupsChanged;
        ctrl.showGroupsFilter = {
            is_grouped: false
        };

        ///////////////////////////

        function showGroupsChanged() {
            if (!ctrl.showSamplesInGroups) {
                ctrl.showGroupsFilter = {
                    is_grouped: false
                }
            } else {
                ctrl.showGroupsFilter = {};
            }
        }
    }
}(angular.module('materialscommons')));
