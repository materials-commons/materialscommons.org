Application.Directives.directive('actionProvenanceWizardStep', actionProvenanceWizardStepDirective);

function actionProvenanceWizardStepDirective() {
    return {
        scope: {
            args: "="
        },
        controller: "actionProvenanceWizardStepDirectiveController",
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/action-provenance-wizard-step.html"
    };
}

Application.Controllers.controller('actionProvenanceWizardStepDirectiveController',
                                   ["$scope", "$stateParams", "model.projects", "provStep",
                                    actionProvenanceWizardStepDirectiveController]);
function actionProvenanceWizardStepDirectiveController($scope, $stateParams, projects, provStep) {
    projects.get($stateParams.id).then(function(project) {
        $scope.project = project;
        $scope.step = $scope.args;
        $scope.template = provStep.templateForStep($scope.project.selectedTemplate, $scope.step);
    });
}
