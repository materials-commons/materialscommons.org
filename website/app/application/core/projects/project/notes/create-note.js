Application.Directives.directive('createNote', createNoteDirective);
function createNoteDirective() {
    return {
        restrict: "EA",
        controller: 'createNoteDirectiveController',
        scope: {
            item: '=item',
            itemType: '@'
        },
        templateUrl: 'application/core/projects/project/notes/create.html'
    };
}

Application.Controllers.controller('createNoteDirectiveController',
    ["$scope", "User", "mcapi", "projectState",
        "$stateParams", "current", "recent",
        createNoteDirectiveController]);

function createNoteDirectiveController($scope, User, mcapi, projectState,
                                       $stateParams, current, recent) {
    $scope.project = current.project();
    var projectID = $scope.project.id;
    var stateID = $stateParams.sid;

    $scope.cancel = function () {
        recent.delete(projectID, stateID);
        projectState.delete(projectID, stateID);
        $scope.noteModel.createNote = false;
        initializeState();
    };

    $scope.save = function () {
        $scope.item.note = {
            'owner': User.u(),
            'project_id': $scope.project.id,
            'note': $scope.noteModel.note,
            'title': $scope.noteModel.title
        };
        switch ($scope.itemType) {
            case "datafile":
                mcapi('/datafile/%/note', $scope.item.id)
                    .success(function (note) {
                        console.log(note);
                    }).put($scope.item.note);
                break;
            case "project":

                break;
            case "sample":

                break;
        }

        //mcapi('/notes')
        //    .success(function (note) {
        //        $scope.project.notes.unshift(note);
        //        recent.gotoLast($scope.project.id);
        //        $scope.model = {};
        //        $scope.model.createNote = false;
        //    }).post($scope.note);
    };

    function initializeState() {
        var defaultModel = {
            note: "",
            title: ""
        };
        $scope.noteModel = projectState.getset(projectID, stateID, defaultModel);
        recent.addIfNotExists(projectID, stateID, "New Note");
    }

    function init() {
        initializeState();
    }

    init();
}
