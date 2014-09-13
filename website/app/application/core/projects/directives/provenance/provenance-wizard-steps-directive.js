Application.Directives.directive('provenanceWizardSteps', provenanceWizardStepsDirective);

function provenanceWizardStepsDirective() {
    return {
        scope: {
            template: "=",
            showOverview: "="
        },
        controller: "provenanceWizardStepsDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/provenance-wizard-steps.html"
    };
}

Application.Controllers.controller('provenanceWizardStepsDirectiveController',
                                   ["$scope", provenanceWizardStepsDirectiveController]);
function provenanceWizardStepsDirectiveController($scope) {
    function templateStepsCount() {
        if (!$scope.template) {
            return 0;
        }

        var count = $scope.template.input_templates.length;
        count += ($scope.template.required_input_files ? 1 : 0);
        count += $scope.template.output_templates.length;
        count += ($scope.template.required_output_files ? 1 : 0);
        return count;
    }

    $scope.offsetSteps = function() {
        return templateStepsCount() == 4;
    };
}
