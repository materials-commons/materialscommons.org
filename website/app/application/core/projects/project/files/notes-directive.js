Application.Controllers.controller('notesController',
    ["$scope", "mcapi", "User", "recent", "Project", notesController]);

function notesController($scope, mcapi, User, recent, Project) {

    $scope.add_notes = function () {
        $scope.note = {
            'item_id': $scope.doc.id,
            'item_type': 'datafile',
            'creator': User.u(),
            'project_id': $scope.project.id,
            'note': $scope.model.new_note,
            'title': $scope.model.title
        };
        $scope.model = {
            new_note: "",
            title: ""
        };
        mcapi('/notes')
            .success(function (note) {
                $scope.project.notes.push(note);
                recent.gotoLast($scope.project.id);
            }).post($scope.note);
    };

    $scope.editNotes = function (index) {
        $scope.edit_index = index;
    };

    $scope.saveNotes = function (note) {
        var i = _.indexOf($scope.project.notes, function (item) {
            return item.id === note.id;
        });
        if (i !== -1) {
            mcapi('/notes')
                .success(function (note) {
                    $scope.project.notes[i] = note;
                }).put({'title': note.title, 'note': note.note, 'id': note.id});
        }
        $scope.edit_index = -1;
    };

    function init() {
        $scope.model = {
            new_note: "",
            title: ""
        };
    }

    init();
}

Application.Directives.directive('notes', notesDirective);
function notesDirective() {
    return {
        restrict: "A",
        scope: {
            edit: "=",
            doc: '=',
            update: '@',
            project: "="
        },
        controller: "notesController",
        templateUrl: 'application/core/projects/project/files/notes.html'
    };
}
