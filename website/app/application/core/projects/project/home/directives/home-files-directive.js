(function (module) {


    module.directive('homeFiles', homeFilesDirective);
    function homeFilesDirective() {
        return {
            restrict: "A",
            controller: 'HomeFilesDirectiveController',
            controllerAs: 'files',
            bindToController: true,
            scope: {
                project: '=project'
            },
            templateUrl: 'application/core/projects/project/home/directives/home-files.html'
        };
    }

    module.controller("HomeFilesDirectiveController", HomeFilesDirectiveController);
    HomeFilesDirectiveController.$inject = ["projectFiles", "$filter", "$modal"];

    /* @ngInject */
    function HomeFilesDirectiveController(projectFiles, $filter, $modal) {
        var ctrl = this;

        var f = projectFiles.model.projects[ctrl.project.id].dir;

        // Root is name of project. Have it opened by default.
        f.showDetails = true;
        ctrl.files = [f];
        ctrl.files[0].expanded = true;
        ctrl.files[0].children = $filter('orderBy')(ctrl.files[0].children, 'displayname');
        ctrl.files.showDetails = true;
        var columnDefs = [
            {
                displayName: "",
                field: "name",
                width: 350,
                cellRenderer: function (params) {
                    return '<i style="color: #BFBFBF;" class="fa fa-fw fa-file"></i><span>' +
                        '<a data-toggle="tooltip" data-placement="top" title="{{params.node.name}}">' +
                        params.node.name + '</a></span>';
                }
            }
        ];

        ctrl.gridOptions = {
            columnDefs: columnDefs,
            rowData: ctrl.files,
            rowClicked: rowClicked,
            rowsAlreadyGrouped: true,
            enableColResize: true,
            enableSorting: true,
            rowHeight: 30,
            angularCompileRows: true,
            icons: {
                groupExpanded: '<i style="color: #D2C4D5 " class="fa fa-folder-open"/>',
                groupContracted: '<i style="color: #D2C4D5 " class="fa fa-folder"/>'

            },
            groupInnerCellRenderer: groupInnerCellRenderer
        };

        function groupInnerCellRenderer(params) {
            return params.node.type === 'datadir' ? params.node.displayname : 'File';
        }

        function rowClicked(params) {
            if (params.node.type == 'datadir') {
                var file = projectFiles.findFileByID($scope.project.id, params.node.datafile_id);
                file.expanded = params.node.expanded;
                if (!params.node.sorted) {
                    file.children = $filter('orderBy')(file.children, 'displayname');
                    file.sorted = true;
                    ctrl.gridOptions.api.onNewRows();
                }
            } else {
                ctrl.modal = {
                    instance: null,
                    item: params.node
                };
                ctrl.modal.item.id = params.node.datafile_id;
                ctrl.modal.instance = $modal.open({
                    size: 'lg',
                    templateUrl: 'application/core/projects/project/home/directives/display-file.html',
                    controller: 'ModalInstanceCtrl',
                    resolve: {
                        modal: function () {
                            return ctrl.modal;
                        },
                        project: function () {
                            return ctrl.project;
                        }
                    }
                });
            }
        }
    }
}(angular.module('materialscommons')));
