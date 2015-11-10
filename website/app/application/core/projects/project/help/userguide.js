(function (module) {
    module.directive("userguide", userguideDirective);
    function userguideDirective() {
        return {
            scope: {},
            bindToController: true,
            restrict: "AE",
            replace: true,
            templateUrl: "application/core/projects/project/help/userguide.html",
            controller: "UserguideDirectiveController",
            controllerAs: 'userguide'
        };
    }

    module.controller("UserguideDirectiveController", UserguideDirectiveController);

    UserguideDirectiveController.$inject = ["help", "ui", "$stateParams"];

    /* @ngInject */
    function UserguideDirectiveController(help, ui, $stateParams) {
        var ctrl = this;

        ctrl.close = close;
        ctrl.toggleExpanded = toggleExpanded;
        ctrl.isExpanded = isExpanded;

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
    }

}(angular.module('materialscommons')));
