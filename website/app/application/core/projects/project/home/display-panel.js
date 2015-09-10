(function (module) {
    module.directive("displayPanel", displayPanelDirective);
    function displayPanelDirective() {
        return {
            scope: {
                panelName: "=panelName",
                project: "=project"
            },
            controller: "displayPanelDirectiveController",
            controllerAs: 'panel',
            bindToController: true,
            restrict: "E",
            replace: true,
            templateUrl: "application/core/projects/project/home/display-panel.html"
        };
    }

    module.controller("displayPanelDirectiveController", displayPanelDirectiveController);
    displayPanelDirectiveController.$inject = ["ui"];

    function displayPanelDirectiveController(ui) {
        var ctrl = this;

        ctrl.show = show;

        /////////////////////

        function show(panel) {
            var expanded = ui.anyExpandedExcept(ctrl.project.id, panel);
            var isShowing = ui.showPanel(ctrl.project.id, panel);
            if (!isShowing) {
                // If user is not showing this item then return false
                return isShowing;
            } else {
                // if expanded is true that means something is expanded
                // besides the requested entry, so return false to show
                // this entry. Otherwise if expanded is false, that means
                // nothing is expanded so return true.
                return !expanded;
            }
        }
    }

}(angular.module('materialscommons')));
