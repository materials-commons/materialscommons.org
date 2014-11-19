Application.Controllers.controller('projectNotesCreate',
    ["$scope", "User", "mcapi", "projectState",
        "$stateParams", "project", "recent",
        projectNotesCreate]);

function projectNotesCreate($scope, User, mcapi, projectState,
                            $stateParams, project, recent) {
    var projectID = project.id;
    var stateID = $stateParams.sid;


    $scope.cancel = function () {
        recent.delete(projectID, stateID);
        projectState.delete(projectID, stateID);
        recent.gotoLast(projectID);
    };

    $scope.create = function () {
        $scope.note = {
            'item_id': projectID,
            'item_type': 'project',
            'creator': User.u(),
            'project_id': project.id,
            'note': $scope.model.note,
            'title': $scope.model.title
        };
        mcapi('/notes')
            .success(function (note) {
                project.notes.push(note);
                recent.gotoLast($scope.project.id);
            }).post($scope.note);
    };

    function initializeState() {
        var defaultModel = {
            note: "",
            title: ""
        };
        $scope.model = projectState.getset(projectID, stateID, defaultModel);
        recent.addIfNotExists(projectID, stateID, "New Note");
    }

    function init() {
        initializeState();
    }
    init();
}
