Application.Directives.directive('homeProcesses', homeProcessesDirective);
function homeProcessesDirective() {
    return {
        restrict: "EA",
        controller: 'homeProcessesDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-processes.html'
    };
}

Application.Controllers.controller("homeProcessesDirectiveController",
                                   ["$scope", "ui",
                                    homeProcessesDirectiveController]);
function homeProcessesDirectiveController($scope, ui) {
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
