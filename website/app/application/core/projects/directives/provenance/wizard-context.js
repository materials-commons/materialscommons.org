Application.Directives.directive('provenanceWizardContext', provenanceWizardContextDirective);

function provenanceWizardContextDirective() {
    return {
        scope: {},
        controller: "provenanceWizardContextController",
        restrict: "AE",
        templateUrl: "application/core/projects/directives/provenance/wizard-context.html"
    };
}

Application.Controllers.controller('provenanceWizardContextController',
                                   ["$scope", "provMagicBarContext",
                                    provenanceWizardContextController]);

function provenanceWizardContextController($scope, provMagicBarContext) {
    $scope.context = provMagicBarContext.get();
}
