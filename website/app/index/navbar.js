(function (module) {
    module.directive("navbar", navbarDirective);

    function navbarDirective() {
        return {
            scope: true,
            restrict: "AE",
            replace: true,
            templateUrl: "index/navbar.html",
            controller: "navbarDirectiveController"
        };
    }

    module.controller("navbarDirectiveController", navbarDirectiveController);
    navbarDirectiveController.$inject = ["$scope", "help", "$state", "pubsub"];

    function navbarDirectiveController($scope, help, $state, pubsub) {
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
            if ($scope.query != "") {
                $state.go('projects.project.search', {query: $scope.query}, {reload: true});
            }
        }

        pubsub.waitOn($scope, 'clear.search', function () {
            $scope.query = "";
        })
    }
}(angular.module('materialscommons')));
