Application.Directives.directive('homeSamples', homeSamplesDirective);

function homeSamplesDirective() {
    return {
        restrict: "A",
        controller: 'homeSamplesController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-samples.html'
    };
}

Application.Controllers.controller("homeSamplesController",
                                   ["$scope", "projectState", "$state",
                                    homeSamplesController]);

function homeSamplesController($scope, projectState, $state) {
    $scope.addSample = function() {
        var stateID = projectState.add($scope.project.id);
        $state.go("projects.project.samples.create", {sid: stateID});
    };
}
