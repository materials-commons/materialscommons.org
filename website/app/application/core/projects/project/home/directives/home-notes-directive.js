(function (module) {
    module.directive('homeNotes', homeNotesDirective);
    function homeNotesDirective() {
        return {
            restrict: "A",
            controller: 'HomeNotesDirectiveController',
            controllerAs: 'view',
            bindToController: true,
            scope: {
                project: '=project'
            },
            templateUrl: 'application/core/projects/project/home/directives/home-notes.html'
        };
    }

    module.controller("HomeNotesDirectiveController", HomeNotesDirectiveController);
    HomeNotesDirectiveController.$inject = ["$filter"];

    /* @ngInject */
    function HomeNotesDirectiveController($filter) {
        var ctrl = this;

        var rowData = [];
        var notes = $filter('orderBy')(ctrl.project.notes, 'title');
        notes.forEach(function (note) {
            var n = $filter('truncate')(note.note, 140, '...');
            rowData.push({
                title: note.title,
                msg: n,
                owner: note.owner,
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
        ctrl.gridOptions = {
            columnDefs: columnDefs,
            rowData: rowData,
            enableColResize: true,
            headerHeight: 0,
            rowHeight: 85,
            rowStyle: {'border-bottom': 'dotted #d3d3d3'},
            angularCompileRows: true
        };

    }
}(angular.module('materialscommons')));
