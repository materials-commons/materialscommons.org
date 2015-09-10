(function (module) {
    module.directive("displayTemplate", displayTemplateDirective);
    function displayTemplateDirective() {
        return {
            restrict: "E",
            replace: true,
            scope: {
                template: "=template",
            },
            controller: "displayTemplateDirectiveController",
            templateUrl: "/display-template.html"
        };
    }

    module.controller("displayTemplateDirectiveController", displayTemplateDirectiveController);
    displayTemplateDirectiveController.$inject = ["$scope", "$state", "pubsub"];

    function displayTemplateDirectiveController($scope, $state, pubsub) {
        $scope.templateChosen = function () {
            if ($scope.useTemplate) {
                pubsub.send("new-wizard.template.selected", $scope.template.id);
                $state.go("projects.project.new-wizard.create-process", {template_id: $scope.template.id});
            }
        };
    }
}(angular.module('materialscommons')));
