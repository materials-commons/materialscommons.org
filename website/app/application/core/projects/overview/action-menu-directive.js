Application.Directives.directive('actionMenu', actionMenuDirective);

function actionMenuDirective() {
    return {
        scope: {
            title: "@",
            titleIcon: "@",
            titleCount: "=",
            menuItems: "="
        },
        controller: 'actionMenuDirectiveController',
        restrict: "AE",
        templateUrl: "application/core/projects/overview/action-menu.html"
    };
}

Application.Controllers.controller('actionMenuDirectiveController',
                                   ["$scope", "projectColors", actionMenuDirectiveController]);

function actionMenuDirectiveController($scope, projectColors) {
    $scope.colors = projectColors;
    $scope.status = {
        isopen: false
    };
}
