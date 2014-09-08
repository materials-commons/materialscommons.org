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
            action: 'create-sample',
            title: 'Create Sample'
        },
        {
            action: 'show-samples',
            title: 'Show Samples'
        }
    ];

    $scope.provenanceMenuItems = [
        {
            action: 'create-provenance',
            title: 'Create Provenance'
        },
        {
            action: 'show-provenance',
            title: 'Show Provenance'
        }
    ];

    Projects.get($scope.projectId).then(function(project) {
        $scope.project = project;
    });
}
