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
                                    "provMagicBarContext", "User",
                                    actionWizardProcessStepController]);

function actionWizardProcessStepController($scope, $stateParams, projects, provMagicBarContext, User) {
    projects.get($stateParams.id).then(function(project) {
        $scope.project = project;
    });

    provMagicBarContext.set("tags", User.attr().preferences.tags);

    $scope.nextStep = function() {
        provMagicBarContext.clear();
        console.dir($scope.project.currentDraft.process);
    };

    $scope.cancelStep = function() {
        console.log("cancelStep");
        provMagicBarContext.clear();
        $scope.project.selectedTemplate = null;
        $scope.toggleStackAction('wizard-process-step');
    };
}
