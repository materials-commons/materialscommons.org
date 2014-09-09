Application.Directives.directive('provenanceWizardControlBar', provenanceWizardControlBarDirective);

function provenanceWizardControlBarDirective() {
    return {
        controller: "actionShowProvenanceDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/provenance-wizard-control-bar.html"
    };
}

Application.Controllers.controller('provenanceWizardControlBarDirectiveController',
                                   ["$scope", provenanceWizardControlBarDirectiveController]);
function provenanceWizardControlBarDirectiveController($scope) {

}
