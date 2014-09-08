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
                                   ["$scope", "projectColors", "model.projects", projectControlBarDirectiveController]);

function projectControlBarDirectiveController($scope, projectColors, Projects) {
    $scope.colors = projectColors;

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

    $scope.provenanceMenuItems = [
        {
            action: 'create-provenance',
            title: 'Create Provenance'
        },
        {
            action: 'list-provenance',
            title: 'Show Provenance'
        }
    ];

    Projects.get($scope.projectId).then(function(project) {
        $scope.project = project;
    });
}
