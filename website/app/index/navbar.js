(function (module) {
    module.directive("navbar", navbarDirective);

    function navbarDirective() {
        return {
            scope: {
                search: '='
            },
            restrict: "E",
            bindToController: true,
            replace: true,
            templateUrl: "index/navbar.html",
            controller: "NavbarDirectiveController",
            controllerAs: 'ctrl'
        };
    }

    module.controller("NavbarDirectiveController", NavbarDirectiveController);
    NavbarDirectiveController.$inject = ['User'];

    function NavbarDirectiveController(User) {
        var ctrl = this;

        ctrl.query = "";
        ctrl.placeholder = ctrl.search === 'projects' ? "SEARCH PROJECTS..." : "SEARCH PROJECT...";

        ctrl.toggleHelp = help;
        ctrl.search = search;
        ctrl.home = home;
        ctrl.user = User.u();

        //pubsub.waitOn($scope, 'clear.search', function () {
        //    ctrl.query = "";
        //});

        ////////////////////////

        function help() {

        }

        function search() {
            //if (ctrl.query != "") {
            //    $state.go('projects.project.search', {query: ctrl.query}, {reload: true});
            //}
        }

        function home() {
            //if (User.isAuthenticated()) {
            //    $state.go("projects.project.home", {id: current.projectID()});
            //} else {
            //    $state.go("home");
            //}
        }
    }

    module.controller("TestDragController", TestDragController);
    TestDragController.$inject = [];
    function TestDragController() {
        var ctrl = this;

        ctrl.messages = [];
        for (var i = 0; i < 10; i++) {
            ctrl.messages.push("This is " + i + " from drag");
        }
    }

    module.controller("TestDropController", TestDropController);
    TestDropController.$inject = [];
    function TestDropController() {
        var ctrl = this;

        ctrl.messages = [];
        for (var i = 0; i < 10; i++) {
            ctrl.messages.push("This is " + i + " from drop");
        }
    }
}(angular.module('materialscommons')));
