Application.Directives.directive('provenanceWizardSteps', provenanceWizardStepsDirective);

function provenanceWizardStepsDirective() {
    return {
        controller: "actionShowProvenanceDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/provenance-wizard-steps.html"
    };
}

Application.Controllers.controller('provenanceWizardStepsDirectiveController',
                                   ["$scope", provenanceWizardStepsDirectiveController]);
function provenanceWizardStepsDirectiveController($scope) {

}
