
Application.Directives.directive('createNote', createNoteDirective);
function createNoteDirective() {
    return {
        restrict: "EA",
        controller: 'createNoteDirectiveController',
        scope: {
            model: '=model'
        },
        templateUrl: 'application/core/projects/project/notes/create.html'
    };
}

Application.Controllers.controller('createNoteDirectiveController',
    ["$scope", "User", "mcapi", "projectState",
        "$stateParams", "current", "recent","pubsub",
        createNoteDirectiveController]);

function createNoteDirectiveController($scope, User, mcapi, projectState,
                            $stateParams, current, recent, pubsub) {
    $scope.project = current.project();
    var projectID = $scope.project.id;
    var stateID = $stateParams.sid;

    $scope.cancel = function () {
        recent.delete(projectID, stateID);
        projectState.delete(projectID, stateID);
        recent.gotoLast(projectID);
        $scope.model.createNote = false;
    };

    $scope.create = function () {
        $scope.note = {
            'item_id': projectID,
            'item_type': 'project',
            'creator': User.u(),
            'project_id': $scope.project.id,
            'note': $scope.model.note,
            'title': $scope.model.title
        };
        mcapi('/notes')
            .success(function (note) {
                $scope.project.notes.unshift(note);
                recent.gotoLast($scope.project.id);
                $scope.model.createNote = false;
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
