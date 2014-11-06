Application.Controllers.controller('projectProvenanceCreate',
                                   ["$scope", "project", "model.templates",
                                    "model.projects", "User", "$filter", "provStep", "projectFiles",
                                    "draft", "$stateParams", "projectState", "recent",
                                    projectProvenanceCreate]);

function projectProvenanceCreate($scope, project, templates, projects,
                                 User, $filter, provStep, projectFiles, draft,
                                 $stateParams, projectState, recent) {
    var stateID = $stateParams.sid;

    $scope.start = function() {
        if (!$scope.wizardState.selectedTemplate) {
            return;
        }
        var templateName = $scope.wizardState.selectedTemplate.template_name;
        var title = "Wizard Process Step (" + templateName + ")";
        $scope.wizardState.currentDraft = draft.createProvenance($scope.wizardState.selectedTemplate, project.id);
        $scope.wizardState.showChooseProcess = false;
        recent.addIfNotExists(project.id, stateID, templateName);
        provStep.setStep($scope.wizardState.project.id, provStep.makeStep("process", "process"));
    };

    $scope.cancel = function() {
        var projectID = $scope.wizardState.project.id;
        provStep.resetProject(projectID);
        recent.delete(project.id, stateID);
        projectState.delete(project.id, stateID);
        recent.gotoLast(project.id);
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

    var defaultWizardState = {
        project: null,
        showOverview: false,
        keepStepsOpen: false,
        reviewContent: false,
        step: null,
        currentDraft: null,
        selectedTemplate: null,
        showChooseProcess: true
    };

    $scope.wizardState = projectState.getset(project.id, stateID, defaultWizardState);
    var step = provStep.getCurrentStep(project.id);
    if ($scope.wizardState.project !== null) {
        // this is a previous state so figure out what step to go to.
        if ($scope.wizardState.step !== null) {
            provStep.setStep(project.id, $scope.wizardState.step);
        } else {
            provStep.setStep(project.id, step);
        }
        var templateName = $scope.wizardState.selectedTemplate.template_name;
        var name = $scope.wizardState.currentDraft.process.name;
        recent.addIfNotExists(project.id, stateID, templateName + ": " + name);
    }
    $scope.wizardState.project = project;
}
