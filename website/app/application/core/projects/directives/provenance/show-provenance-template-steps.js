Application.Directives.directive('showProvenanceTemplateSteps', showProvenanceTemplateStepsDirective);

function showProvenanceTemplateStepsDirective() {
    return {
        scope: {
            template: "=",
            showOverview: "="
        },
        controller: "showProvenanceTemplateStepsDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/show-provenance-template-steps.html"
    };
}

Application.Controllers.controller('showProvenanceTemplateStepsDirectiveController',
                                   ["$scope", "$stateParams", "provStep",
                                    showProvenanceTemplateStepsDirectiveController]);
function showProvenanceTemplateStepsDirectiveController($scope, $stateParams, provStep) {
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

    $scope.gotoStep = function(templateType, templateID) {
        var step = provStep.makeStep(templateType, templateID);
        provStep.setStep($stateParams.id, step);
    };
}
