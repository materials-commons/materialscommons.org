Application.Directives.directive("sidebarTags", sidebarTagsDirective);

function sidebarTagsDirective() {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "index/sidebar-tags.html",
        controller: "sidebarTagsDirectiveController"
    };
}

Application.Controllers.controller("sidebarTagsDirectiveController",
                                   ["$scope", "User", "$state", "projectState",
                                    "current", sidebarTagsDirectiveController]);

function sidebarTagsDirectiveController($scope, User, $state, projectState, current) {
    $scope.tags = User.attr().preferences.tags;
    $scope.showTags = false;

    $scope.createTag = function() {
        var project = current.project();
        var state = null;
        var stateID = projectState.add(project.id, state);
        $state.go("projects.project.tags.create", {sid: stateID});
    };
}
