Application.Directives.directive("sidebar", sidebarDirective);

function sidebarDirective() {
    return {
        scope: true,
        restrict: "AE",
        replace: true,
        templateUrl: "index/sidebar.html",
        controller: "sidebarDirectiveController"
    };
}

Application.Controllers.controller("sidebarDirectiveController",
                                   ["$scope", "recent", "current",
                                    "pubsub", "model.projects", "User",
                                    sidebarDirectiveController]);

function sidebarDirectiveController($scope, recent, current, pubsub, projects, User) {
    $scope.showAllRecent = false;

    function setupSidebar(project) {
        $scope.project = project;
        $scope.recents = recent.getAll($scope.project.id);
    }

    pubsub.waitOn($scope, "sidebar.project", function() {
        projects.getList().then(function(p) {
            $scope.projects = p;
        });
        var project = current.project();
        setupSidebar(project);
    });

    $scope.isAuthenticated = function() {
        return User.isAuthenticated();
    };
}
