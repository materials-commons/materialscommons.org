Application.Directives.directive('actionWizardProcessStep', actionWizardProcessStepDirective);

function actionWizardProcessStepDirective() {
    return {
        scope: {},
        controller: "actionWizardProcessStepController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/provenance/provenance-wizard-process-step.html"
    };
}

Application.Controllers.controller('actionWizardProcessStepController',
                                   ["$scope", "$stateParams", "model.projects",
                                    "provStep", "actionStack", actionWizardProcessStepController]);

function actionWizardProcessStepController($scope, $stateParams, projects, provStep, actionStack) {
    projects.get($stateParams.id).then(function(project) {
        $scope.project = project;
    });

    function nextProcessStep() {
        var nextStep = provStep.nextStep("process", "process", $scope.project.selectedTemplate);
        actionStack.toggleStackAction('provenance-wizard-step', "The step title", null, nextStep);
    }

    $scope.nextStep = function() {
        nextProcessStep();
        actionStack.toggleStackAction('wizard-process-step');
    };

    $scope.cancelStep = function() {
        $scope.project.selectedTemplate = null;
        actionStack.toggleStackAction('wizard-process-step');
    };
}
