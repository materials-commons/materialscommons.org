Application.Directives.directive('wizardStepOverview', wizardStepOverviewDirective);

function wizardStepOverviewDirective() {
    return {
        scope: {
            template: "="
         },
         restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-overview.html"
    };
}
