angular.module('materialscommons').directive('selectItemsSamples', selectItemsSamplesDirective);
function selectItemsSamplesDirective() {
    return {
        restrict: 'E',
        scope: {
            samples: '='
        },
        controller: SelectItemsSamplesDirectiveController,
        controllerAs: 'ctrl',
        bindToController: true,
        templateUrl: 'app/global.services/select-items/select-items-samples.html'
    }
}

function SelectItemsSamplesDirectiveController() {
    'ngInject';

    var ctrl = this;

    ctrl.selected = [];
    ctrl.showSamplesInGroups = false;
    ctrl.showGroupsChanged = showGroupsChanged;
    ctrl.showGroupsFilter = {
        is_grouped: false
    };
    ctrl.toggleSampleSelected = toggleSampleSelected;

    /////////////////////////

    function showGroupsChanged() {
        if (!ctrl.showSamplesInGroups) {
            ctrl.showGroupsFilter = {
                is_grouped: false
            }
        } else {
            ctrl.showGroupsFilter = {};
        }
    }

    function toggleSampleSelected(sample) {
        sample.selected = !sample.selected;
        console.log('sample', sample);
    }
}

