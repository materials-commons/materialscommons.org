Application.Directives.directive('homeNotes', homeNotesDirective);
function homeNotesDirective() {
    return {
        restrict: "A",
        controller: 'homeNotesDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-notes.html'
    };
}

Application.Controllers.controller("homeNotesDirectiveController",
    ["$scope", "Events", "pubsub",
        homeNotesDirectiveController]);

function homeNotesDirectiveController($scope, Events, pubsub) {
    $scope.service = Events.getService();
    $scope.notes = [];
    $scope.notes = $scope.service.notes;
    pubsub.waitOn($scope, "clicked_date", function(date) {
        $scope.clicked_date = date;
        $scope.notes = Events.getEventsByDate($scope.service.grouped_notes, $scope.clicked_date);

    });
}

