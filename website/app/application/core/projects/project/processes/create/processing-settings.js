(function (module) {
    module.directive('processSettings', processSettingsDirective);
    function processSettingsDirective() {
        return {
            restrict: 'E',
            scope: {
                settings: '='
            },
            controller: 'ProcessSettingsDirectiveController',
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'application/core/projects/project/processes/create/process-settings.html'
        }
    }

    module.controller('ProcessSettingsDirectiveController', ProcessSettingsDirectiveController);
    ProcessSettingsDirectiveController.$inject = [];

    function ProcessSettingsDirectiveController() {
        var ctrl = this;

        // Set default value on selections to first choice.
        ctrl.settings.forEach(function(setting) {
            // selection type
            if (setting.property._type === 'selection') {
                setting.property.value = setting.property.choices[0];
            }

            // unit selections
            if (setting.property.units.length !== 0) {
                setting.property.unit = setting.property.units[0];
            }
        });
    }
}(angular.module('materialscommons')));