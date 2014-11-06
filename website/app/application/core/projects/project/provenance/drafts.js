Application.Controllers.controller('projectProvenanceDrafts',
                                   ["$scope", "$stateParams", "project", "projectState",
                                    "model.templates", "Restangular", "User", "$state",
                                    projectProvenanceDrafts]);

function projectProvenanceDrafts($scope, $stateParams, project, projectState,
                                 Templates, Restangular, User, $state) {
    var templates = null;
    $scope.drafts = project.drafts;

    Templates.getList().then(function(t) {
        templates = t;
    });

    function getTemplate(templateID) {
        var i = _.indexOf(templates, function(template) {
            return template.id === templateID;
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
        var stateID = projectState.add(project.id, wizardState);
        $state.go("projects.project.provenance.create", {sid: stateID});
    };

    $scope.deleteDraft = function(index) {
        Restangular.one("drafts", $scope.drafts[index].id)
            .remove({apikey: User.apikey()}).then(function() {
                $scope.drafts.splice(index, 1);
            });
    };
}
