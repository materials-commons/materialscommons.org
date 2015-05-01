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
    ["$scope", "ui",
        homeNotesDirectiveController]);

function homeNotesDirectiveController($scope, ui) {
    var rowData = [];
    $scope.project.notes.forEach(function (note) {
        rowData.push({
            title: note.title,
            note: note.note,
            owner: note.creator,
            mtime: note.mtime
        });
    });
    var columnDefs = [
        {
            displayName: "",
            field: "title",
            width: 830,
            template: '<span ng-bind="data.title"></span>' +
            '<p><small class="text-muted"><i class="fa fa-fw fa-user"></i>' +
            '<span ng-bind="data.owner"></span>' +
            '<small  style="padding-left: 60px;" ng-bind="data.mtime"></small></small></p>' +
            '<p ta-bind="text" ng-model="data.note" ta-readonly="disabled"></p>',
            cellStyle: {border: 0}
        }
    ];
    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        enableColResize: true,
        headerHeight: 0,
        rowHeight: 65,
        rowStyle: {'border-bottom': 'dotted #d3d3d3'},
        angularCompileRows: true
    };
    $scope.minimize = function () {
        ui.togglePanelState($scope.project.id, 'notes');
    };

    $scope.toggleExpanded = function () {
        ui.toggleIsExpanded($scope.project.id, "notes");
    };

    $scope.isExpanded = function () {
        return ui.isExpanded($scope.project.id, "notes");
    };

    $scope.createNote = function () {
        $scope.model.createNote = true;
    };

    $scope.splitScreen = function (what, col) {
        ui.toggleColumns($scope.project.id, what, col);
    };

    $scope.isSplitExpanded = function () {
        return ui.getSplitStatus($scope.project.id);
    };

    $scope.model = {
        createNote: false
    };
}
