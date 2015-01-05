Application.Directives.directive("homeSampleDetails", homeSampleDetailsDirective);
function homeSampleDetailsDirective() {
    return {
        restrict: "AE",
        scope: true,
        controller: 'homeSampleDetailsController',
        replace: true,
        templateUrl: "application/core/projects/project/home/directives/home-sample-details.html"
    };
}

Application.Controllers.controller("homeSampleDetailsController",
    ["$scope", "current", "Project",
        homeSampleDetailsController]);

function homeSampleDetailsController($scope, current, Project) {
    $scope.sample.notes = Project.getSpecificNotes(current.project(), $scope.sample.id, 'sample');
    $scope.note = $scope.sample.notes[0];
}
