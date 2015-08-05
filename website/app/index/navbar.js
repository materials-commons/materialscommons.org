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
    ["$scope", "help", "$state", "searchQuery", "current",
        navbarDirectiveController]);

function navbarDirectiveController($scope, help, $state, searchQuery, current) {
    // This is needed to toggle the menu closed when an item is selected.
    // This is a part of how ui-bootstrap interacts with the menus and
    // the menu item does an ng-click.
    $scope.status = {
        isopen: false
    };

    $scope.toggleHelp = function () {
        help.toggle();
    };

    $scope.search = search;

    ////////////////////////

    function search() {
        var projectID = current.projectID();
        if ($scope.query != "") {
            searchQuery.set(projectID, $scope.query);
            $state.go('projects.project.search', {query: $scope.query}, {reload: true});
        }
    }
}
