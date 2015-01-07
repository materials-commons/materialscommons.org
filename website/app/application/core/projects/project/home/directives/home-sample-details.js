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
    console.log($scope.sample);
    console.log(current.project());
    //currently we have a single note for a sample. This could change at the time of sample rework
    var notes = Project.getSpecificNotes(current.project(), $scope.sample.id, 'sample');
    $scope.note = notes[0];
}
