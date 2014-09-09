Application.Directives.directive('actionWizardProcessStep', actionWizardProcessStepDirective);

function actionWizardProcessStepDirective() {
    return {
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
        //console.dir($scope.project.selectedTemplate);
        //console.dir($scope.project.currentDraft);
    });
}
