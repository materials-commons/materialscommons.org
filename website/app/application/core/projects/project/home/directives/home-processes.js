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
    ["$scope", "projectState", "$state", "pubsub",
        homeProcessesDirectiveController]);
function homeProcessesDirectiveController($scope,  projectState, $state, pubsub) {
    function segmentProcesses() {
        $scope.bk = {all: []};
        $scope.project.drafts.forEach(function (draft) {
            $scope.bk.all.push(draft);
        });
        $scope.project.processes.forEach(function (process) {
            $scope.bk.all.push(process);
        });

        var columnDefs = [
            {
                displayName: "",
                field: "name",
                width: 300,
                template: '<span ng-bind="data.name"></span>' +
                '<p><small><small  class="text-muted">{{data.mtime | toDateString}}</small></small></p>',
                cellStyle: {border: 0}
            },
            {
                displayName: "",
                field: "owner",
                width: 300,
                template: '<span ng-bind="data.owner"></span>',
                cellStyle: {border: 0}
            },
            {displayName: "", field: "", width: 300, cellStyle: {border: 0}}
        ];
        var rowData = [];
        $scope.project.processes.forEach(function (process) {
            rowData.push({name: process.name, owner: process.owner, mtime: process.mtime});
        });

        $scope.gridOptions = {
            columnDefs: columnDefs,
            rowData: rowData,
            enableColResize: true,
            headerHeight: 0,
            rowHeight: 60,
            angularCompileRows: true
        };
    }

    pubsub.waitOn($scope, "processes.change", function () {
        segmentProcesses();
    });
    $scope.createProcess = function () {
        var state = null;
        var stateID = projectState.add($scope.project.id, state);
        $state.go("projects.project.home.provenance", {sid: stateID});
    };
    segmentProcesses();
}
