Application.Directives.directive('modalProcesses', modalProcessesDirective);
function modalProcessesDirective() {
    return {
        restrict: "EA",
        controller: 'modalProcessesDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/modal/process-modal.html'
    };
}

Application.Controllers.controller("modalProcessesDirectiveController",
    ["$scope", "$modal", "pubsub",
        modalProcessesDirectiveController]);
function modalProcessesDirectiveController($scope, $modal, pubsub) {
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
            field: "selected",
            width: 100,
            checkboxSelection: true,
            cellStyle: {border: 0}
        },
        {
            displayName: "",
            field: "name",
            width: 300,
            cellClicked: cellClickedFunc,
            template: '<span><a>{{data.name}}</a></span>' +
            '<p><small><small  class="text-muted">{{data.mtime | toDateString}}</small></small></p>',
            cellStyle: {border: 0}
        },
        {
            displayName: "",
            field: "owner",
            width: 300,
            cellTemplate: '<span ng-bind="data.owner"></span>',
            cellStyle: {border: 0}
        },
        {displayName: "", field: "", width: 300, cellStyle: {border: 0}}
    ];

    var rowData = [];
    $scope.project.processes.forEach(function (process) {
        process.selected = true;
        rowData.push(process);
    });

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        enableColResize: true,
        headerHeight: 0,
        rowHeight: 60,
        angularCompileRows: true,
        rowSelection: 'multiple',
        rowSelected: function (process) {
            pubsub.send('addProcessToReview', process);
        },
        suppressRowClickSelection: true
    };

    function cellClickedFunc(params) {
        $scope.modal = {
            instance: null,
            process: params.data
        };

        $scope.modal.instance = $modal.open({
            template: '<display-process modal="modal"></display-process>',
            scope: $scope,
            size: 'lg'
        });
    }


}
