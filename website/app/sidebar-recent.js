Application.Directives.directive("sidebarRecent", sidebarRecentDirective);

function sidebarRecentDirective() {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "sidebar-recent.html",
        controller: "sidebarRecentDirectiveController"
    };
}

Application.Controllers.controller("sidebarRecentDirectiveController",
                                   ["$scope", "recent", sidebarRecentDirectiveController]);

function sidebarRecentDirectiveController($scope, recent) {
    $scope.showAllRecent = false;

    $scope.recentIcon = function(itemType) {
        return recent.icon(itemType);
    };
}
