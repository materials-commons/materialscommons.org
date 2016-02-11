(function (module) {
    module.directive("navbar", navbarDirective);

    function navbarDirective() {
        return {
            scope: true,
            restrict: "AE",
            replace: true,
            templateUrl: "index/navbar.html",
            controller: "NavbarDirectiveController",
            controllerAs: 'ctrl'
        };
    }

    module.controller("NavbarDirectiveController", NavbarDirectiveController);
    NavbarDirectiveController.$inject = ["$scope", "help", "$state", "pubsub", "current", "User"];

    function NavbarDirectiveController($scope, help, $state, pubsub, current, User) {
        var ctrl = this;

        // This is needed to toggle the menu closed when an item is selected.
        // This is a part of how ui-bootstrap interacts with the menus and
        // the menu item does an ng-click.
        ctrl.status = {
            isopen: false
        };
        ctrl.query = "";

        ctrl.toggleHelp = help.toggle;
        ctrl.search = search;
        ctrl.home = home;

        pubsub.waitOn($scope, 'clear.search', function () {
            ctrl.query = "";
        });

        ////////////////////////

        function search() {
            if (ctrl.query != "") {
                $state.go('projects.project.search', {query: ctrl.query}, {reload: true});
            }
        }

        function home() {
            if (User.isAuthenticated()) {
                $state.go("projects.project.home", {id: current.projectID()});
            } else {
                $state.go("home");
            }
        }
    }
}(angular.module('materialscommons')));
