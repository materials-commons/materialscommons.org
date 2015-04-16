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
        "$stateParams", "current", "recent", "pubsub", "projectFiles",
        createNoteDirectiveController]);

function createNoteDirectiveController($scope, User, mcapi, projectState,
                                       $stateParams, current, recent, pubsub, projectFiles) {
    $scope.project = current.project();
    var projectID = $scope.project.id;
    var stateID = $stateParams.sid;

    $scope.cancel = function () {
        switch ($scope.itemType) {
            case "datafile":
                 pubsub.send('datafile-note.change');
                break;
            case "project":
                recent.delete(projectID, stateID);
                projectState.delete(projectID, stateID);
                $scope.noteModel.createNote = false;
                initializeState();
                break;
            case "sample":
                recent.delete(projectID, stateID);
                projectState.delete(projectID, stateID);
                $scope.noteModel.createNote = false;
                initializeState();
                break;
        }
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
                        $scope.item.notes = [note];
                        projectFiles.setActiveFile($scope.item);
                        pubsub.send('datafile-note.change');
                    }).put($scope.item.note);
                break;
            case "project":

                break;
            case "sample":

                break;
        }
    };

    function initializeState() {
        var defaultModel = {
            note: "",
            title: ""
        };
        $scope.noteModel = projectState.getset(projectID, stateID, defaultModel);
        if($scope.itemType === 'datafile' && $scope.item.notes){
            $scope.noteModel = $scope.item.notes[0];
        }
        recent.addIfNotExists(projectID, stateID, "New Note");
    }

    function init() {
        initializeState();
    }

    init();
}
