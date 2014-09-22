Application.Directives.directive('wizardStepProcess', wizardStepProcessDirective);

function wizardStepProcessDirective() {
    return {
        scope: {
            project: "="
        },
        controller: "wizardStepProcessController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/provenance/wizard-step-process.html"
    };
}

Application.Controllers.controller('wizardStepProcessController',
                                   ["$scope", "provStep", wizardStepProcessController]);

function wizardStepProcessController($scope, provStep) {
    $scope.nextStep = function() {
        var s = provStep.nextStep("process", "process", $scope.project.selectedTemplate);
        provStep.setStep($scope.project.id, s);
    };

    $scope.cancelStep = function() {
        $scope.project.selectedTemplate = null;
        $scope.step = provStep.setStep(provStep.makeStep("", ""));
    };
}
