(function (module) {
    module.controller('ProjectHomeController', ProjectHomeController);
    ProjectHomeController.$inject = ["project", "$filter"];

    function ProjectHomeController(project, $filter) {
        var ctrl = this;
        ctrl.project = project;

        var columnDefs = [
            {headerName: "Name", field: "name"},
            {headerName: "Owner", field: "owner"}
        ];

        var samples = $filter('orderBy')(ctrl.project.samples, 'name');

        ctrl.gridOptions = {
            columnDefs: columnDefs,
            rowData: samples,
            rowHeight: 45
        }
    }

}(angular.module('materialscommons')));
