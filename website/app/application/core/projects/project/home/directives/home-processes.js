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
                                   ["$scope", "ui", "projectState", "$state", "pubsub",
                                    homeProcessesDirectiveController]);
function homeProcessesDirectiveController($scope, ui, projectState, $state, pubsub) {
    function segmentProcesses() {
        $scope.bk = {
            all: []
        }

        $scope.project.drafts.forEach(function(draft) {
            if (!('showDetails' in draft)) {
                draft.showDetails = false;
            }
            $scope.bk.all.push(draft);
        });
        $scope.project.processes.forEach(function(process) {
            if (!('showDetails' in process)) {
                process.showDetails = false;
            }
            $scope.bk.all.push(process);
        });
    }

    pubsub.waitOn($scope, "processes.change", function() {
        segmentProcesses();
    });

    $scope.toggleExpanded = function() {
        ui.toggleIsExpanded($scope.project.id, "processes");
    };

    $scope.isExpanded = function() {
        return ui.isExpanded($scope.project.id, "processes");
    };

    $scope.minimize = function() {
        ui.togglePanelState($scope.project.id, 'processes');
    };

    $scope.createProcess = function() {
        var state = null;
        var stateID = projectState.add($scope.project.id, state);
        //$state.go("projects.project.home.provenance", {sid: stateID});
        $state.go("projects.project.new-wizard");
    };

    $scope.splitScreen = function(what, col){
        ui.toggleColumns($scope.project.id, what, col);
    };

    $scope.isSplitExpanded = function () {
        return ui.getSplitStatus($scope.project.id);
    };

    segmentProcesses();
}
