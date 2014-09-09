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
            title: 'Create Sample (c s)'
        },
        {
            action: 'show-samples',
            title: 'Show Samples (s s)'
        }
    ];

    $scope.provenanceMenuItems = [
        {
            action: 'create-provenance',
            title: 'Create Provenance (c p)'
        },
        {
            action: 'show-provenance',
            title: 'Show Provenance (s p)'
        }
    ];

    $scope.reviewsMenuItems = [
        {
            action: 'create-review',
            title: 'Create Review (c r)'
        },
        {
            action: 'show-reviews',
            title: 'Show Reviews (s r)'
        }
    ];

    $scope.draftsMenuItems = [
        {
            action: 'show-drafts',
            title: 'Show Drafts (s d)'
        }
    ];

    $scope.notesMenuItems = [
        {
            action: 'create-note',
            title: 'Create Note (c n)'
        },
        {
            action: 'show-notes',
            title: 'Show Notes (s n)'
        }
    ];

    Projects.get($scope.projectId).then(function(project) {
        $scope.project = project;
    });
}
