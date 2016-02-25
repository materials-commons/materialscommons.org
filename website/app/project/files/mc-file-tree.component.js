(function (module) {
    module.component('mcFileTree', {
        templateUrl: 'project/files/mc-file-tree.html',
        controller: 'MCFileTreeComponentController'
    });

    module.controller('MCFileTreeComponentController', MCFileTreeComponentController);
    MCFileTreeComponentController.$inject = ["$scope", "project", "$state", "$stateParams", "pubsub", "projectsService", "gridFiles"];
    function MCFileTreeComponentController($scope, project, $state, $stateParams, pubsub, projectsService, gridFiles) {
        var ctrl = this;
        var proj = project.get();

        projectsService.getProjectDirectory(proj.id).then(function (files) {
            proj.files = gridFiles.toGrid(files);
            ctrl.files = proj.files;
            ctrl.files[0].expanded = true;
            init();
            ctrl.gridShowingFlag = true;
        });

        pubsub.waitOn($scope, 'files.refresh', function (f) {
            var treeModel = new TreeModel(),
                root = treeModel.parse(proj.files[0]);
            var file = root.first({strategy: 'pre'}, function (node) {
                return node.model.data.id === f.id;
            });
            if (file) {
                file.model.data.name = f.name;
                ctrl.gridOptions.api.recomputeAggregates();
                ctrl.gridOptions.api.refreshGroupRows();
                ctrl.gridOptions.api.refreshView();
                ctrl.gridShowingFlag = !ctrl.gridShowingFlag;
            }
        });

        projectsService.onChange($scope, function (dirID) {
            projectsService.getProjectDirectory(proj.id, dirID).then(function (files) {
                loadFilesIntoDirectory(dirID, files);
            });
        });

        ///////////////////////////////

        function init() {
            var columnDefs = [
                {
                    headerName: "",
                    field: "name",
                    width: 350,
                    cellRenderer: {
                        renderer: 'group',
                        innerRenderer: function (params) {
                            if (params.data._type == 'directory') {
                                return '<span' + ' id="' + params.data.id + '">' + params.data.name + '</span>';
                            }

                            var icon = "fa-file";
                            switch (params.data.mediatype.mime) {
                            case "application/pdf":
                                icon = "fa-file-pdf-o";
                                break;
                            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                                icon = "fa-file-excel-o";
                                break;
                            case "application/vnd.ms-excel":
                                icon = "fa-file-excel-o";
                                break;
                            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                                icon = "fa-file-word-o";
                                break;
                            case "application/ms-word":
                                icon = "fa-file-word-o";
                                break;
                            case "application/vnd.ms-powerpoint.presentation.macroEnabled.12":
                                icon = "fa-file-powerpoint-o";
                                break;
                            case "application/vnd.ms-powerpoint":
                                icon = "fa-file-powerpoint-o";
                                break;
                            default:
                                if (isImage(params.data.mediatype.mime)) {
                                    icon = "fa-file-image-o";
                                }
                                break;
                            }
                            return '<i class="file-tree-icon-color fa fa-fw ' + icon + '"></i><span title="' + params.data.name + '">' +
                                params.data.name + '</span>';
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
                angularCompileRows: false,
                icons: {
                    groupExpanded: '<i class="file-tree-icon-color fa fa-folder-open"/>',
                    groupContracted: '<i class="file-tree-icon-color fa fa-folder"/>'
                }
            };

            if (!$stateParams.file_id) {
                $state.go('project.files.dir', {dir_id: ctrl.files[0].data.id});
            }
        }

        function rowClicked(params) {
            if (params.data._type == 'directory') {
                handleDirectory(params);
            } else {
                handleFile(params);
            }
        }

        function handleDirectory(params) {
            if (!params.data.childrenLoaded) {
                projectsService.getProjectDirectory(proj.id, params.data.id).then(function (files) {
                    loadFilesIntoDirectory(params.data.id, files);
                    $state.go('project.files.dir', {dir_id: params.data.id});
                });
            } else {
                ctrl.gridShowingFlag = !ctrl.gridShowingFlag;
                $state.go('project.files.dir', {dir_id: params.data.id});
            }
        }

        function loadFilesIntoDirectory(dirID, files) {
            var treeModel = new TreeModel(),
                root = treeModel.parse(proj.files[0]);
            var dir = root.first({strategy: 'pre'}, function (node) {
                return node.model.data.id === dirID;
            });
            dir.model.children = gridFiles.toGridChildren(files);
            dir.model.data.childrenLoaded = true;
            ctrl.gridOptions.api.onNewRows();
            ctrl.gridShowingFlag = !ctrl.gridShowingFlag;
        }

        function handleFile(params) {
            $state.go('project.files.file', {file_id: params.data.id});
        }
    }
}(angular.module('materialscommons')));
