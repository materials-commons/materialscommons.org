Application.Directives.directive('projectControlBar', projectControlBarDirective);

function projectControlBarDirective() {
    return {
        scope: {
            projectId: "@"
        },
        controller: 'projectControlBarDirectiveController',
        restrict: "AE",
        templateUrl: "application/core/projects/overview/project-control-bar.html"
    };
}

Application.Controllers.controller('projectControlBarDirectiveController',
                                   ["$rootScope", "$scope", "model.projects", projectControlBarDirectiveController]);

function projectControlBarDirectiveController($rootScope, $scope, Projects) {
    $scope.currentProjectColor = $rootScope.currentProjectColor;
    $scope.currentProjectColorLight = $rootScope.currentProjectColorLight;

    $scope.samplesMenuItems = [
        {
            action: 'action1',
            title: 'title1'
        },
        {
            action: 'action2',
            title: 'title2'
        }
    ];

    Projects.get($scope.projectId).then(function(project) {
        $scope.project = project;
    });
}
