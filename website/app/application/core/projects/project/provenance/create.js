Application.Controllers.controller('projectProvenanceCreate',
                                   ["$scope", "project", "model.templates",
                                    "model.projects", "User", "$filter", "provStep", "projectFiles",
                                    "draft", "ui", "$stateParams", "projectState",
                                    projectProvenanceCreate]);

function projectProvenanceCreate($scope, project, templates, projects,
                                 User, $filter, provStep, projectFiles, draft,
                                 ui, $stateParams, projectState) {
    var stateID = $stateParams.sid;

    $scope.start = function() {
        if (!$scope.wizardState.selectedTemplate) {
            return;
        }
        var templateName = $scope.wizardState.selectedTemplate.template_name;
        var title = "Wizard Process Step (" + templateName + ")";
        $scope.wizardState.currentDraft = draft.createProvenance($scope.wizardState.selectedTemplate, project.id);
        $scope.wizardState.showChooseProcess = false;
        provStep.setStep($scope.wizardState.project.id, provStep.makeStep("process", "process"));
    };

    $scope.cancel = function() {
        var projectID = $scope.wizardState.project.id;
        provStep.resetProject(projectID);
        ui.setShowFiles(projectID, true);
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

    projectFiles.setChannel("provenance.files");
    var state = projectState.get(project.id, stateID);
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
        projectState.set(project.id, stateID, $scope.wizardState);
    }
}
