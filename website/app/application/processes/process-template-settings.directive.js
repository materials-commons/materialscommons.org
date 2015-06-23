Application.Directives.directive("processSettings", processSettingsDirective);

function processSettingsDirective() {
    return {
        restrict: "E",
        scope: {
            settings: "=settings"
        },
        templateUrl: "application/processes/process-settings.html",
        controller: "processSettingsController"
    }
}

Application.Controllers.controller("processSettingsController",
    ["$scope", processSettingsController]);

function processSettingsController($scope) {

}
