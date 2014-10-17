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
                                   ["$scope", "ui", "current", "$state",
                                    navbarDirectiveController]);

function navbarDirectiveController($scope, ui, current, $state) {
    // This is needed to toggle the menu closed when an item is selected.
    // This is a part of how ui-bootstrap interacts with the menus and
    // the menu item does an ng-click.
    $scope.status = {
        isopen: false
    };

    $scope.create = function(action) {
        var projectID = current.projectID();
        var route = "";
        $scope.status = false;

        switch (action) {
        case "provenance":
            route = "createprov";
            break;
        case "sample":
            route = "createsample";
            break;
        case "review":
            route = "createreview";
            break;
        case "note":
            route = "createnote";
            break;
        default: return;
        }

        $state.go("projects.project." + route, {id: projectID});
    };
}
