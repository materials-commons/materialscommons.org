(function (module) {
    module.directive('selectItemsSamples', selectItemsSamplesDirective);
    function selectItemsSamplesDirective() {
        return {
            restrict: 'E',
            scope: {
                samples: '='
            },
            controller: 'SelectItemsSamplesDirectiveController',
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'application/directives/partials/select-items-samples.html'
        }
    }

    module.controller('SelectItemsSamplesDirectiveController', SelectItemsSamplesDirectiveController);
    SelectItemsSamplesDirectiveController.$inject = [];

    function SelectItemsSamplesDirectiveController() {
        var ctrl = this;

        ctrl.showSamplesInGroups = false;
        ctrl.showGroupsChanged = showGroupsChanged;
        ctrl.showGroupsFilter = {
            is_grouped: false
        };

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
    }
}(angular.module('materialscommons')));

