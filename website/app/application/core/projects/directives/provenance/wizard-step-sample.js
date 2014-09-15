Application.Directives.directive('wizardStepSample', wizardStepSampleDirective);

function wizardStepSampleDirective() {
    return {
        scope: {
            project: "=",
            template: "=",
            step: "="
        },
        controller: "wizardStepSampleDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-sample.html"
    };
}

Application.Controllers.controller('wizardStepSampleDirectiveController',
                                   ["$scope", "$stateParams", "provStep", "actionStack",
                                    wizardStepSampleDirectiveController]);
function wizardStepSampleDirectiveController($scope, $stateParams, provStep, actionStack) {
    $scope.next = function() {
        var nextStep = provStep.nextStep($scope.step.stepType, $scope.step.step,
                                        $scope.project.selectedTemplate);
        actionStack.toggleStackAction('provenance-wizard-step', "Another step title",
                                      null, nextStep);
        actionStack.toggleStackAction('provenance-wizard-step', "Another step title",
                                      null, nextStep);
    };
}
