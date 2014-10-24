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
                                   ["$scope", "recent", "$state",
                                    sidebarRecentDirectiveController]);

function sidebarRecentDirectiveController($scope, recent) {
    $scope.showAllRecent = true;

    $scope.gotoRecent = function(r) {
        recent.gotoRecent($scope.project.id, r.id);
    };
}
