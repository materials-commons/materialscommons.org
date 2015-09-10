(function (module) {
    module.directive("userguide", userguideDirective);
    function userguideDirective() {
        return {
            scope: true,
            bindToController: true,
            restrict: "AE",
            replace: true,
            templateUrl: "application/core/projects/project/help/userguide.html",
            controller: "UserguideDirectiveController",
            controllerAs: 'userguide'
        };
    }

    module.controller("UserguideDirectiveController", UserguideDirectiveController);

    UserguideDirectiveController.$inject = ["$scope", "help", "ui", "$stateParams"];

    /* @ngInject */
    function UserguideDirectiveController($scope, help, ui, $stateParams) {
        var ctrl = this;

        ctrl.close = close;
        ctrl.toggle = toggle;
        ctrl.toggleExpanded = toggleExpanded;
        ctrl.isExpanded = isExpanded;
        ctrl.goTo = goTo;

        ctrl.showSamples = false;

        ////////////////////////

        function close () {
            help.toggle();
            ui.setIsExpanded($stateParams.id, "help", false);
        }

        function toggleExpanded() {
            ui.toggleIsExpanded($stateParams.id, "help");
        }

        function isExpanded() {
            return ui.isExpanded($stateParams.id, "help");
        }

        function goTo(what) {
            $scope.showSamples = true;
        }
    }

});
