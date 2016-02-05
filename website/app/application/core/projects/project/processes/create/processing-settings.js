(function (module) {
    module.directive('processSettings', processSettingsDirective);
    function processSettingsDirective() {
        return {
            restrict: 'E',
            scope: {
                settings: "="
            },
            templateUrl: 'application/core/projects/project/processes/create/process-settings.html'
        }
    }
}(angular.module('materialscommons')));