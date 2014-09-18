Application.Directives.directive('actionAreaButton', actionAreaButtonDirective);

function actionAreaButtonDirective() {
    return {
        scope: {
            actionName: "@",
            title: "@",
            continueTitle: "@",
            titleIcon: "@",
            projectId: "="
        },
        controller: "actionAreaButtonDirectiveController",
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/action-area-button.html"
    };
}

Application.Controllers.controller('actionAreaButtonDirectiveController',
                                   ["$scope", "projectColors", "actionStatus",
                                    actionAreaButtonDirectiveController]);

function actionAreaButtonDirectiveController($scope, projectColors, actionStatus) {
    $scope.toggleAction = function() {
        actionStatus.toggleAction($scope.projectId, $scope.actionName);
    };

    $scope.buttonStyle = function() {
        var color = projectColors.getCurrentProjectColor();

        if ($scope.isContinue()) {
            color = projectColors.getCurrentProjectColorLight();
        }

        return {
            'background-color': color
        };
    };

    $scope.isContinue = function() {
        if (!actionStatus.isCurrentAction($scope.projectId, $scope.actionName) &&
            actionStatus.isActionActive($scope.projectId, $scope.actionName)) {
            return true;
        }
        return false;
    };

    $scope.isCurrentAction = function() {
        return actionStatus.isCurrentAction($scope.projectId, $scope.actionName);
    };
}
