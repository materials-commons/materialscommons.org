Application.Directives.directive('homeNotes', homeNotesDirective);
function homeNotesDirective() {
    return {
        restrict: "A",
        controller: 'homeNotesDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-notes.html'
    };
}

Application.Controllers.controller("homeNotesDirectiveController",
    ["$scope", "$filter",
        homeNotesDirectiveController]);

function homeNotesDirectiveController($scope, $filter) {
    var rowData = [];
    $scope.project.notes.forEach(function (note) {
        var n = $filter('truncate')( note.note,140, '...');
        rowData.push({
            title: note.title,
            msg: n ,
            owner: note.creator,
            mtime: note.mtime
        });
    });
    var columnDefs = [
        {
            displayName: "",
            field: "title",
            width: 900,
            template: '<span ng-bind="data.title"></span>' +
            '<p class="text-muted"><small><i class="fa fa-fw fa-user"></i>' +
            '<span  class="text-muted">{{data.owner}}</span>' +
            '<small  style="padding-left: 60px;">{{data.mtime | toDateString}}</small></small></p>' +
            '<div style="font-size: 12px;" class="text-muted" ta-bind="text" ng-model="data.msg"></div>',
            cellStyle: {border: 0}
        }
    ];
    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        enableColResize: true,
        headerHeight: 0,
        rowHeight: 85,
        rowStyle: {'border-bottom': 'dotted #d3d3d3'},
        angularCompileRows: true
    };

}
