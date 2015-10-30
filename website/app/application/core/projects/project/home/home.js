(function (module) {
    module.controller('ProjectHomeController', ProjectHomeController);
    ProjectHomeController.$inject = ["project", "$filter", "modalInstance"];

    function ProjectHomeController(project, $filter, modalInstance) {

        var ctrl = this;
        ctrl.project = project;

        ctrl.chooseTemplate = chooseTemplate;

        var columnDefs = [
            {headerName: "Name", field: "name"},
            {
                headerName: "Composition", field: "composition",
                cellRenderer: function(params){
                    var measure = '';
                    params.data.properties.forEach(function(property){
                        if (property.attribute === 'composition'){
                            measure =  property.best_measure[0];
                        }
                    });
                    if (measure !== ''){
                        return  measure.element + ': ' + measure.value+ ' '+measure.unit;
                    } else{
                        return '-';
                    }

                }
            },
            {headerName: "Owner", field: "owner"},
            {headerName: "Description", field: "description"},
            {headerName: "Files", field: "files"}
        ];

        var samples = $filter('orderBy')(ctrl.project.samples, 'name');

        ctrl.gridOptions = {
            columnDefs: columnDefs,
            rowData: samples,
            rowHeight: 45
        };

        function chooseTemplate() {
            modalInstance.chooseTemplate(ctrl.project);
        }
    }
}(angular.module('materialscommons')));
