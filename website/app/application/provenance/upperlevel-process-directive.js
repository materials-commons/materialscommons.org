Application.Controllers.controller('NoteRunController',
    ["$scope", "User", "dateGenerate", function ($scope, User, dateGenerate) {
        $scope.add_notes = function () {
            $scope.doc.notes.push({'message': $scope.bk.new_note, 'who': User.u(), 'date': dateGenerate.new_date()});
            $scope.bk.new_note = "";
        };

        $scope.add_run = function () {
            if ($scope.doc.template.template_pick === 'experiment') {
                $scope.doc.runs.push({'started': $scope.bk.exp_run_date, 'stopped': '', 'error_messages': ''});
            } else {
                $scope.doc.runs.push({'started': $scope.bk.start_run, 'stopped': $scope.bk.stop_run, 'error_messages': $scope.bk.new_err_msg});
                $scope.bk.new_err_msg = "";
                $scope.bk.start_run = "";
                $scope.bk.stop_run = "";
            }
        };

    }]);

Application.Directives.directive('upperlevelProcess',
    function () {
        return {
            restrict: "A",
            controller: "NoteRunController",
            scope: {
                doc: '=',
                edit: '=',
                bk: '='
            },
            templateUrl: 'application/provenance/upperlevel-process.html'
        };
    });
