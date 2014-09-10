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
                                   ["$scope", "$stateParams", "model.templates",
                                    "model.projects", actionWizardProcessStepController]);

function actionWizardProcessStepController($scope, $stateParams, templates, projects) {
    projects.get($stateParams.id).then(function(project) {
        $scope.project = project;
    });

    $scope.nextStep = function() {
        console.dir($scope.project.currentDraft.process);
    };

    $scope.cancelStep = function() {
        console.log("cancelStep");
        $scope.project.selectedTemplate = null;
        $scope.toggleStackAction('wizard-process-step');
    };
}
