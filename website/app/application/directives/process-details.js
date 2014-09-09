Application.Directives.directive('processDetails', processDetailsDirective);

function processDetailsDirective() {
    return {
        scope: {
            process: "="
        },
        controller: "processDetailsController",
        restrict: "AE",
        templateUrl: "application/directives/process-details.html"
    };
}

Application.Controllers.controller('processDetailsController',
                                   ["$scope", "User", processDetailsController]);
function processDetailsController($scope, User) {
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
        $scope.process.run_dates.push(angular.copy($scope.run, run));
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
