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
        };

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

        var columnDefs = [
            {displayName: "", field: "name", width: 300, template: '<span style="font-weight: bold;" ng-bind="data.name"></span>' +
            '<p style="padding-top:12px;"><small  class="text-muted">April 30, 2015</small></p>' , cellStyle:{border: 0}},
            {displayName: "", field: "owner", width: 300 ,  template: '<span style="padding-top:100px;" ng-bind="data.owner"></span>', cellStyle:{border: 0}},
            {displayName: "", field: "", width: 300,  cellStyle:{border: 0}}
        ];
        var rowData = []
        $scope.project.processes.forEach(function(process) {
            rowData.push({name: process.name, owner: process.owner});
        });
        $scope.gridOptions = {
            columnDefs: columnDefs,
            rowData: rowData,
            enableColResize: true,
            headerHeight: 0,
            rowHeight:60,
            //colWidth: 500,
            angularCompileRows:true
        };
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
        $state.go("projects.project.home.provenance", {sid: stateID});
    };

    $scope.splitScreen = function(what, col){
        ui.toggleColumns($scope.project.id, what, col);
    };

    $scope.isSplitExpanded = function () {
        return ui.getSplitStatus($scope.project.id);
    };

    segmentProcesses();











}
