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
                                    "provMagicBarContext", "User", "provTemplate",
                                    actionWizardProcessStepController]);

function actionWizardProcessStepController($scope, $stateParams, projects, provMagicBarContext, User, provTemplate) {
    projects.get($stateParams.id).then(function(project) {
        $scope.project = project;
    });

    provMagicBarContext.set("tags", User.attr().preferences.tags);

    function nextProcessStep() {
        var nextStep = provTemplate.nextStep("process", "process", $scope.project.selectedTemplate);
        console.dir(nextStep);
    }

    $scope.nextStep = function() {
        provMagicBarContext.clear();
        nextProcessStep();
        $scope.toggleStackAction('wizard-process-step');
    };

    $scope.cancelStep = function() {
        console.log("cancelStep");
        provMagicBarContext.clear();
        $scope.project.selectedTemplate = null;
        $scope.toggleStackAction('wizard-process-step');
    };
}
