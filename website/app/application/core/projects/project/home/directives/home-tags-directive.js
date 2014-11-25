Application.Directives.directive('homeTags', homeTagsDirective);
function homeTagsDirective() {
    return {
        restrict: "EA",
        controller: 'homeTagsDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-tags.html'
    };
}

Application.Controllers.controller("homeTagsDirectiveController",
    ["$scope", homeTagsDirectiveController]);
function homeTagsDirectiveController($scope) {

}
