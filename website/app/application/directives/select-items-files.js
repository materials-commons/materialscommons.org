(function (module) {
    module.directive('selectItemsFiles', selectItemsFilesDirective);
    function selectItemsFilesDirective() {
        return {
            restrict: 'E',
            scope: {
                files: '='
            },
            controller: 'SelectItemsFilesDirectiveController',
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'application/directives/partials/select-items-files.html'
        }
    }

    module.controller('SelectItemsFilesDirectiveController', SelectItemsFilesDirectiveController);
    SelectItemsFilesDirectiveController.$inject = ["Restangular", "gridFiles", "fileType"];
    function SelectItemsFilesDirectiveController(Restangular, gridFiles, fileType) {
        var ctrl = this;

        ctrl.gridShowingFlag = true;
        ctrl.files[0].expanded = true;

        init();

        ///////////////

        function init() {
            var columnDefs = [
                {
                    headerName: "",
                    field: "name",
                    width: 350,
                    cellRenderer: {
                        renderer: 'group',
                        innerRenderer: function (params) {
                            var icon = fileType.icon(params.data);
                            if (params.data._type == 'directory') {
                                return '<span' + ' id="' + params.data.id + '">' + params.data.name + '</span>';
                            }

                            return '<i style="color: #D2C4D5;" class="fa fa-fw ' + icon + '"></i><span title="' +
                                params.data.name + '">' + params.data.name + '</span>';
                        }
                    }
                }
            ];

            ctrl.gridOptions = {
                columnDefs: columnDefs,
                rowData: ctrl.files,
                rowClicked: rowClicked,
                rowSelection: 'single',
                rowsAlreadyGrouped: true,
                enableColResize: false,
                enableSorting: false,
                rowHeight: 30,
                angularCompileRows: true,
                icons: {
                    groupExpanded: '<i style="color: #D2C4D5 " class="fa fa-folder-open"/>',
                    groupContracted: '<i style="color: #D2C4D5 " class="fa fa-folder"/>'
                }
            };
        }

        function rowClicked(params) {
            if (params.data._type == 'directory') {
                handleDirectory(params);
            }
        }

        function handleDirectory(params) {
            if (!params.data.childrenLoaded) {
                Restangular.one('v2').one('projects', project.id)
                    .one('directories', params.data.id).get().then(function(files) {
                        var treeModel = new TreeModel(),
                            root = treeModel.parse(project.files[0]);
                        var dir = root.first({strategy: 'pre'}, function (node) {
                            return node.model.data.id === params.data.id;
                        });
                        dir.model.children = gridFiles.toGridChildren(files);
                        dir.model.data.childrenLoaded = true;
                        ctrl.gridOptions.api.onNewRows();
                        ctrl.gridShowingFlag = !ctrl.gridShowingFlag;
                    });
            } else {
                ctrl.gridShowingFlag = !ctrl.gridShowingFlag;
            }
        }
    }
}(angular.module('materialscommons')));
