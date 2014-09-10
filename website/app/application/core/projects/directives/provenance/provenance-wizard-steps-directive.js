Application.Directives.directive('provenanceWizardSteps', provenanceWizardStepsDirective);

function provenanceWizardStepsDirective() {
    return {
        scope: {
            template: "=",
            showOverview: "="
        },
        controller: "actionShowProvenanceDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/provenance-wizard-steps.html"
    };
}

Application.Controllers.controller('provenanceWizardStepsDirectiveController',
                                   ["$scope", provenanceWizardStepsDirectiveController]);
function provenanceWizardStepsDirectiveController($scope) {

}
