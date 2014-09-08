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
                                   ["$rootScope", "$scope", actionMenuDirectiveController]);

function actionMenuDirectiveController($rootScope, $scope) {
    $scope.currentProjectColor = $rootScope.currentProjectColor;
    $scope.currentProjectColorLight = $rootScope.currentProjectColorLight;
    $scope.status = {
        isopen: false
    };
}
