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
                                   ["$scope", "User", sidebarTagsDirectiveController]);

function sidebarTagsDirectiveController($scope, User) {
    $scope.tags = User.attr().preferences.tags;
    $scope.showTags = false;
}
