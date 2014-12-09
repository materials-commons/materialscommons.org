Application.Directives.directive("navbar", navbarDirective);

function navbarDirective() {
    return {
        scope: true,
        restrict: "AE",
        replace: true,
        templateUrl: "index/navbar.html",
        controller: "navbarDirectiveController"
    };
}

Application.Controllers.controller("navbarDirectiveController",
                                   ["$scope", "current", "$state", "projectState",
                                    "pubsub", "model.projects", "help",
                                    navbarDirectiveController]);

function navbarDirectiveController($scope, current, $state, projectState, pubsub, Projects, help) {
    // This is needed to toggle the menu closed when an item is selected.
    // This is a part of how ui-bootstrap interacts with the menus and
    // the menu item does an ng-click.
    $scope.status = {
        isopen: false
    };

    $scope.toggleHelp = function() {
        help.toggle();
    };

    $scope.open_reviews_count = 0;

    $scope.create = function(action) {
        var projectID = current.projectID();
        var route = "projects.project." + action + ".create";
        var state = null;
        var stateID = projectState.add(projectID, state);
        $scope.status = false;
        $state.go(route, {id: projectID, sid: stateID});
    };

    pubsub.waitOn($scope, "reviews.change", function() {
        Projects.getList().then(function (projects) {
            $scope.open_reviews_count = 0;
            projects.forEach(function(prj){
                $scope.open_reviews_count++;
            });
        });
    });
}
