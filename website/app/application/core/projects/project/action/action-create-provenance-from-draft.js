Application.Directives.directive('actionCreateProvenanceFromDraft', actionCreateProvenanceFromDraft);

function actionCreateProvenanceFromDraft() {
    return {
        scope: {
            project: "="
        },
        replace: true,
        controller: "actionCreateProvenanceFromDraftController",
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/action-create-provenance-from-draft.html"
    };
}

Application.Controllers.controller('actionCreateProvenanceFromDraftController',
                                   ["$scope", "$stateParams", "model.projects",
                                    "actionStatus", "model.templates", "Restangular",
                                    "User", "ui",
                                    actionCreateProvenanceFromDraftController]);

function actionCreateProvenanceFromDraftController($scope, $stateParams, projects,
                                                   actionStatus, Templates, Restangular,
                                                   User, ui) {
    var project = null;
    var templates = null;

    projects.get($stateParams.id).then(function(proj) {
        $scope.drafts = proj.drafts;
        project = proj;
    });

    Templates.getList().then(function(t) {
        templates = t;
    });

    function getTemplate(templateID) {
        var i = _.indexOf(templates, function(template) {
            return template.id == templateID;
        });
        return templates[i];
    }

    $scope.useDraft = function(index) {
        // Set current state so when we start provenance it will
        // start with this item.
        var wizardState = {
            showOverview: false,
            keepStepsOpen: false,
            reviewContent: false,
            step: {
                step: "process",
                stepType: "process"
            },
            currentDraft: $scope.drafts[index],
            showChooseProcess: false,
            selectedTemplate: getTemplate($scope.drafts[index].process.template_id)
        };
        actionStatus.setActionState($stateParams.id, "create-provenance-new", wizardState);
        actionStatus.toggleAction(project.id, "create-provenance-from-draft");
        actionStatus.toggleAction(project.id, "create-provenance-new");
    };

    $scope.deleteDraft = function(index) {
        Restangular.one("drafts", $scope.drafts[index].id)
            .remove({apikey: User.apikey()}).then(function() {
                $scope.drafts.splice(index, 1);
            });
    };

    $scope.cancel = function() {
        actionStatus.toggleCurrentAction(project.id);
        ui.setShowFiles($scope.project.id, true);
        ui.setShowToolbarTabs($scope.project.id, true);
    };
}
