Application.Controllers.controller('notesController',
                                   ["$scope", "mcapi", "User", "alertService",
                                    "dateGenerate", "pubsub", notesController]);

function notesController ($scope, mcapi, User, alertService, dateGenerate, pubsub) {

    $scope.add_notes = function () {
        $scope.doc.notes.push({'message': $scope.model.new_note, 'who': User.u(), 'date': dateGenerate.new_date()});
        $scope.saveData();
        $scope.model.new_note = "";
        pubsub.send('notes.add');
    };

    $scope.saveData = function () {
        switch ($scope.type) {
        case "datafile":
            mcapi('/datafile/update/%', $scope.doc.id)
                .success(function (data) {
                    //alertService.sendMessage("Notes has been added");
                }).error(function (data) {
                    alertService.sendMessage(data.error);
                }).put($scope.doc);
            break;

        case "project":
            mcapi('/projects/%/update', $scope.doc.id)
                .success(function (data) {
                    //alertService.sendMessage("Notes has been added");
                }).error(function (data) {
                    alertService.sendMessage(data.error);
                }).put($scope.doc);
            break;

        case "sample":
            if($scope.update == 'true'){
                mcapi('/objects/update/%', $scope.doc.id)
                    .success(function (data) {
                        //alertService.sendMessage("Notes has been updated");
                    }).put($scope.doc);
            }
            // Sample notes is stored/saved in the samples controller
            break;

        case "process":
            if($scope.update == 'true'){
                mcapi('/process/update/%', $scope.doc.id)
                    .success(function (data) {
                        //alertService.sendMessage("Notes has been updated");
                    }).put($scope.doc);
            }
            // Process notes is stored/saved in the Process controller
            break;
        }
    };

    $scope.editNotes = function(index){
        $scope.edit_index = index;
    };

    $scope.saveNotes = function(index){
        $scope.saveData();
        $scope.edit_index = -1;
    };

    function init() {
        $scope.model = {
            new_note: ""
        };
    }

    init();
}

Application.Directives.directive('notes', notesDirective);
function notesDirective () {
    return {
        restrict: "A",
        controller: "notesController",
        scope: {
            edit: "=",
            doc: '=',
            type: '@',
            update: '@'
        },
        templateUrl: 'application/directives/notes.html'
    };
}
