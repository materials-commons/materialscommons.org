Application.Directives.directive('actionCreateProvenance', actionCreateProvenance);

function actionCreateProvenance() {
    return {
        scope: {
            project: "="
        },
        controller: "actionCreateProvenanceController",
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/action-create-provenance.html"
    };
}

Application.Controllers.controller('actionCreateProvenanceController',
                                   ["$scope", "$stateParams", "model.templates",
                                    "model.projects", "User", "$filter", "provStep",
                                    "actionStatus", "draft", actionCreateProvenanceController]);

function actionCreateProvenanceController($scope, $stateParams, templates, projects,
                                          User, $filter, provStep, actionStatus, draft) {
    $scope.start = function() {
        var templateName = $scope.wizardState.selectedTemplate.template_name;
        var title = "Wizard Process Step (" + templateName + ")";
        $scope.wizardState.currentDraft = draft.createProvenance($scope.wizardState.selectedTemplate);
        $scope.wizardState.showChooseProcess = false;
        provStep.setStep($scope.wizardState.project.id, provStep.makeStep("process", "process"));
    };

    $scope.cancel = function() {
        var projectID = $scope.wizardState.project.id;
        actionStatus.clearCurrentActionState(projectID);
        provStep.resetProject(projectID);
        actionStatus.toggleCurrentAction(projectID);
    };

    templates.getList().then(function(templates) {
        $scope.templates = $filter('byKey')(templates, 'template_type', 'process');

        // Set the category name for sorting purposes
        $scope.templates.forEach(function(template) {
            template.category = "Process - " + template.category;
        });
        // Add the preferred templates
        if (User.attr().preferences.templates.length !== 0) {
            User.attr().preferences.templates.forEach(function(t) {
                var template = $filter('byKey')(templates, 'id', t.id);
                var preferred;
                if (template) {
                    preferred = angular.copy(template[0]);
                    preferred.category = "Preferred";
                    $scope.templates.push(preferred);
                }
            });
        }
    });

    projects.get($stateParams.id).then(function(project) {
        var state = actionStatus.getCurrentActionState(project.id);
        var step = provStep.getCurrentStep(project.id);
        if (state) {
            $scope.wizardState = state;
            $scope.wizardState.project = project;
            // Take us back to the last step.
            if (state.step !== null) {
                provStep.setStep(project.id, state.step);
            } else {
                provStep.setStep(project.id, step);
            }
        } else {
            $scope.wizardState = {
                project: project,
                showOverview: false,
                keepStepsOpen: false,
                reviewContent: false,
                step: null,
                currentDraft: null,
                selectedTemplate: null,
                showChooseProcess: true
            };
            actionStatus.setCurrentActionState(project.id, $scope.wizardState);
        }
    });
}
