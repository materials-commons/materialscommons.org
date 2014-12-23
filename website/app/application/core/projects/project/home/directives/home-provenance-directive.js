Application.Directives.directive('homeProvenance', homeProvenanceDirective);
function homeProvenanceDirective() {
    return {
        restrict: "EA",
        controller: 'homeProvenanceDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-provenance.html'
    };
}

Application.Controllers.controller("homeProvenanceDirectiveController",
                                   ["$scope", "ui",
                                    homeProvenanceDirectiveController]);
function homeProvenanceDirectiveController($scope, ui) {
    $scope.toggleExpanded = function() {
        ui.toggleIsExpanded($scope.project.id, "processes");
    };

    $scope.isExpanded = function() {
        return ui.isExpanded($scope.project.id, "processes");
    };

    $scope.all = [];
    $scope.project.processes.forEach(function(process) {
        if (!('showDetails' in process)) {
            process.showDetails = false;
        }
        $scope.all.push(process);
    });

    $scope.project.drafts.forEach(function(draft) {
        if (!('showDetails' in draft)) {
            draft.showDetails = false;
        }
        $scope.all.push(draft);
    });
}
