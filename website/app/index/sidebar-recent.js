Application.Directives.directive("sidebarRecent", sidebarRecentDirective);

function sidebarRecentDirective() {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "index/sidebar-recent.html",
        controller: "sidebarRecentDirectiveController"
    };
}

Application.Controllers.controller("sidebarRecentDirectiveController",
                                   ["$scope", "recent", "pubsub",
                                    sidebarRecentDirectiveController]);

function sidebarRecentDirectiveController($scope, recent, pubsub) {
    $scope.showAllRecent = false;
    $scope.recentIcon = function(itemType) {
        return recent.icon(itemType);
    };
}
