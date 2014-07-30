Application.Controllers.controller('NotesController',
    ["$scope", "mcapi", "User", "alertService", "dateGenerate", function ($scope, mcapi, User, alertService, dateGenerate) {

        $scope.add_notes = function () {
            $scope.doc.notes.push({'message': $scope.model.new_note, 'who': User.u(), 'date': dateGenerate.new_date()});
            $scope.saveData();
            $scope.model.new_note = "";
        };
        $scope.saveData = function () {
            if ($scope.type === 'datafile') {
                mcapi('/datafile/update/%', $scope.doc.id)
                    .success(function (data) {
                        alertService.sendMessage("Notes has been added");
                    }).error(function (data) {
                        alertService.sendMessage(data.error);
                    }).put($scope.doc);
            }
            if ($scope.type === 'project') {
                mcapi('/projects/%/update', $scope.doc.id)
                    .success(function (data) {
                        alertService.sendMessage("Notes has been added");
                    }).error(function (data) {
                        alertService.sendMessage(data.error);
                    }).put($scope.doc);
            }
            if($scope.type === 'sample'){
                if($scope.update == 'true'){
                    mcapi('/objects/update/%', $scope.doc.id)
                        .success(function (data) {
                            alertService.sendMessage("Notes has been updated");
                        }).put($scope.doc);
                }
                // Sample notes is stored/saved in the samples controller
            }
            if($scope.type === 'process'){
                if($scope.update == 'true'){
                    mcapi('/process/update/%', $scope.doc.id)
                        .success(function (data) {
                            alertService.sendMessage("Notes has been updated");
                        }).put($scope.doc);
                }
                // Process notes is stored/saved in the Process controller
            }

        };
        $scope.editNotes = function(index){
            $scope.edit_index = index;
        }
        $scope.saveNotes = function(index){
            $scope.saveData();
            $scope.edit_index = -1;
        }

        function init() {
            $scope.model = {
                new_note: ""
            };
        }

        init();

    }]);

Application.Directives.directive('notes',
    function () {
        return {
            restrict: "A",
            controller: "NotesController",
            scope: {
                edit: "=",
                doc: '=',
                type: '@',
                update: '@'
            },
            templateUrl: 'application/directives/notes.html'
        };
    });