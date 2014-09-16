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
                                   ["$scope", "projectColors", "model.projects", "pubsub",projectControlBarDirectiveController]);

function projectControlBarDirectiveController($scope, projectColors, Projects, pubsub) {
    $scope.colors = projectColors;

    pubsub.waitOn($scope, 'update_reviews.change', function() {
        Projects.getList(true).then(function (data) {
            $scope.projects = data;
            Projects.get($scope.projectId).then(function (project) {
                $scope.project = project;
                pubsub.send('update_reviews.change');
            });

        });
    });
    pubsub.waitOn($scope, 'update_samples.change', function() {
        Projects.get($scope.projectId).then(function(project) {
            $scope.project = project;
        });
    });

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
    $scope.settingsMenuItems = [
        {
            action: 'show-settings',
            title: 'Show Settings'
        }
    ];


    Projects.get($scope.projectId).then(function(project) {
        $scope.project = project;
    });
}
