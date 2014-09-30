Application.Directives.directive('processRuns', processRunsDirective);

function processRunsDirective() {
    return {
        scope: {
            runs: "="
        },
        controller: "processRunsController",
        restrict: "AE",
        templateUrl: "application/core/projects/directives/provenance/process-runs.html"
    };
}

Application.Controllers.controller('processRunsController',
                                   ["$scope", "User", processRunsController]);

function processRunsController($scope, User) {
    $scope.run = {
        start: new Date(),
        stop: new Date(),
        note: "",
        notes: []
    };

    $scope.showAddRun = false;
    $scope.showAddNote = false;

    function resetRun() {
        $scope.run = {
            start: new Date(),
            stop: new Date(),
            note: "",
            notes: []
        };
    }

    $scope.addRun = function() {
        var run = {};
        $scope.runs.push(angular.copy($scope.run, run));
        $scope.showAddRun = false;
        resetRun();
    };

    $scope.addNote = function() {
        var note = {
            message: $scope.run.note,
            who: User.u(),
            date: new Date()
        };
        $scope.run.notes.push(note);
        $scope.note = "";
        $scope.showAddNote = false;
    };

    $scope.discardNote = function() {
        $scope.run.note = "";
        $scope.showAddNote = false;
    };
}
