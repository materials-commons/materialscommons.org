Application.Directives.directive("displayPanel", displayPanelDirective);
function displayPanelDirective() {
    return {
        scope: {
            panelName: "=panelName",
            project: "=project"
        },
        controller: "displayPanelDirectiveController",
        restrict: "E",
        replace: true,
        templateUrl: "application/core/projects/project/home/display-panel.html"
    };
}

Application.Controllers.controller("displayPanelDirectiveController",
                                   ["$scope", "ui", displayPanelDirectiveController]);
function displayPanelDirectiveController($scope, ui) {
    $scope.show = function (panel) {
        var expanded = ui.anyExpandedExcept($scope.project.id, panel);
        var isShowing = ui.showPanel(panel, $scope.project.id);
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
    };

}
