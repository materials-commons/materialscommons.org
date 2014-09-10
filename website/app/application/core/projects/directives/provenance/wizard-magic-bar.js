Application.Directives.directive('provenanceWizardMagicBar', provenanceWizardMagicBarDirective);

function provenanceWizardMagicBarDirective() {
    return {
        scope: {},
        controller: "provenanceWizardMagicBarController",
        restrict: "AE",
        templateUrl: "application/core/projects/directives/provenance/wizard-magic-bar.html"
    };
}

Application.Controllers.controller('provenanceWizardMagicBarController',
                                   ["$scope", "$stateParams", "model.projects",
                                    "pubsub", provenanceWizardMagicBarController]);

function provenanceWizardMagicBarController($scope, $stateParams, projects, pubsub) {
    $scope.magicBarActive = false;

    pubsub.waitOn($scope, 'prov.magicbar', function() {
        $scope.magicBarActive = !$scope.magicBarActive;
        projects.get($stateParams.id).then(function(project) {
            $scope.project = project;
        });
    });

    $scope.dismiss = function() {
        $scope.magicBarActive = false;
    };
}
