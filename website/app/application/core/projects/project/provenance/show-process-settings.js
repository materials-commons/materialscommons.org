Application.Directives.directive("showProcessSettings", showProcessSettingsDirective);
function showProcessSettingsDirective() {
    return {
        scope: {
            settings: "=settings"
        },
        restrict: "AE",
        replace: true,
        templateUrl: "application/core/projects/project/provenance/show-process-settings.html"
    };
}
