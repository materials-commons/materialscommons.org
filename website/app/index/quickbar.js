Application.Directives.directive("quickbar", quickbarDirective);

function quickbarDirective() {
    return {
        scope: true,
        restrict: "AE",
        replace: true,
        templateUrl: "index/quickbar.html",
        controller: "quickbarDirectiveController"
    };
}

Application.Controllers.controller("quickbarDirectiveController",
    ["$scope", "recent", "current",
        "pubsub", "model.projects", "User",
        sidebarDirectiveController]);

function quickbarDirectiveController($scope, recent, current, pubsub, projects, User) {

}
