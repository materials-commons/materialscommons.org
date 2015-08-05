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
    ["$scope", "pubsub", "$filter", "modalInstance", homeProcessesDirectiveController]);
function homeProcessesDirectiveController($scope, pubsub, $filter, modalInstance) {
    function segmentProcesses() {
        var columnDefs = [
            {
                displayName: "",
                field: "name",
                width: 300,
                template: '<div class="cursor-pointer"><span ng-bind="data.name"></span>' +
                '<p><small><small  class="text-muted">{{data.mtime | toDateString}}</small></small></p></div>',
                cellStyle: {border: 0}
            },
            {
                displayName: "",
                field: "owner",
                width: 300,
                template: '<div class="cursor-pointer"><span ng-bind="data.owner"></span></div>',
                cellStyle: {border: 0}
            },
            {displayName: "", field: "", width: 300, cellStyle: {border: 0}}
        ];
        var rowData = [];
        var processes = $filter('orderBy')($scope.project.processes, 'name');
        processes.forEach(function (process) {
            rowData.push({name: process.name, owner: process.owner, mtime: process.mtime, id: process.id});
        });
        $scope.gridOptions = {
            columnDefs: columnDefs,
            rowData: rowData,
            rowClicked: rowClicked,
            enableColResize: true,
            headerHeight: 0,
            rowHeight: 60,
            angularCompileRows: true
        };
    }

    function rowClicked(params) {
        var i = _.indexOf($scope.project.processes, function (proc) {
            return proc.id == params.data.id;
        });
        if (i !== -1) {
            modalInstance.openModal($scope.project.processes[i], 'process', $scope.project);
        }
    }

    pubsub.waitOn($scope, "processes.change", function () {
        segmentProcesses();
    });

    segmentProcesses();
}
