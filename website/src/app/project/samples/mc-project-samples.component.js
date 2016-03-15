angular.module('materialscommons').component('mcProjectSamples', {
    templateUrl: 'app/project/samples/mc-project-samples.html',
    controller: MCProjectSamplesComponentController
});

function MCProjectSamplesComponentController(project) {
    'ngInject';

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