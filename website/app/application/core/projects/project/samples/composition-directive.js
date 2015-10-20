(function (module) {
    module.directive("composition", compositionDirective);

    function compositionDirective() {
        return {
            scope: {
                properties: '='
            },
            restrict: "E",
            templateUrl: "application/core/projects/project/samples/composition.html",
            controller: "compositionDirectiveController",
            controllerAs: 'ctrl',
            bindToController: true
        };
    }

    module.controller("compositionDirectiveController", compositionDirectiveController);
    compositionDirectiveController.$inject = [];

    function compositionDirectiveController() {
        var ctrl = this;
        var i = _.indexOf(ctrl.properties, function (property) {
            return property.attribute === 'composition'
        });
        if (i > -1) {
            ctrl.composition = ctrl.properties[i];
        }
    }
}(angular.module('materialscommons')));
