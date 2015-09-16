(function (module) {
    module.controller("FilesAllController", FilesAllController);

    FilesAllController.$inject = ["$scope", "projectFiles", "project", "mcfile", "$state",
        "pubsub", "$filter", "mcapi", "gridFiles"];

    /* @ngInject */
    function FilesAllController($scope, projectFiles, project, mcfile, $state, pubsub, $filter, mcapi, gridFiles) {
        var ctrl = this;

        ctrl.gridShowingFlag = true;
        ctrl.files = project.files;
        ctrl.files[0].expanded = true;

        pubsub.waitOn($scope, 'files.refresh', function () {
            ctrl.gridOptions.api.recomputeAggregates();
            ctrl.gridOptions.api.refreshGroupRows();
            ctrl.gridOptions.api.refreshView();
            ctrl.gridShowingFlag = !ctrl.gridShowingFlag;
        });

        ctrl.fileSrc = fileSrc;

        init();

        ///////////////////////////////

        function fileSrc(file) {
            return mcfile.src(file.id);
        }

        function rowClicked(params) {
            if (params.data._type == 'directory' && !params.data.childrenLoaded) {
                mcapi('/projects2/%/dir/%', project.id, params.data.id)
                    .success(function (files) {
                        var treeModel = new TreeModel(),
                            root = treeModel.parse(project.files[0]);
                        var dir = root.first({strategy: 'pre'}, function (node) {
                            return node.model.data.id === params.data.id;
                        });
                        dir.model.children = gridFiles.toGridChildren(files);
                        dir.model.data.childrenLoaded = true;
                        ctrl.gridOptions.api.onNewRows();
                    }).get();
            } else if (params.data._type == 'directory') {
                ctrl.gridShowingFlag = !ctrl.gridShowingFlag;
            }
            //if (params.node._type == 'datadir') {
            //    projectFiles.setActiveDirectory(params.node);
            //    var file = projectFiles.findFileByID(project.id, params.node.datafile_id);
            //    file.expanded = params.node.expanded;
            //    if (!params.node.sorted) {
            //        file.children = $filter('orderBy')(file.children, 'displayname');
            //        file.sorted = true;
            //        ctrl.gridOptions.api.onNewRows();
            //    }
            //} else {
            //    projectFiles.setActiveFile(params.node);
            //}
            //$state.go('projects.project.files.all.edit', {
            //    file_id: params.node.datafile_id,
            //    file_type: params.node.type
            //});
        }

        function init() {
            var columnDefs = [
                {
                    headerName: "",
                    field: "name",
                    width: 350,
                    cellRenderer: {
                        renderer: 'group',
                        innerRenderer: function (params) {
                            return '<span' + ' id="' + params.data.id + '">' + params.data.name + '</span>';

                            var icon = "fa-file";
                            switch (params.node.mediatype.mime) {
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
                                if (isImage(params.node.mediatype.mime)) {
                                    icon = "fa-file-image-o";
                                }
                                break;
                            }
                            return '<i style="color: #D2C4D5;" class="fa fa-fw ' + icon + '"></i><span title="' + params.node.name + '">' +
                                '<a data-toggle="tooltip" data-placement="top">' +
                                params.node.name + '</a></span>';
                        }
                    }
                }];

            ctrl.gridOptions = {
                columnDefs: columnDefs,
                rowData: ctrl.files,
                rowClicked: rowClicked,
                rowsAlreadyGrouped: true,
                enableColResize: false,
                enableSorting: false,
                rowHeight: 30,
                angularCompileRows: false,
                icons: {
                    groupExpanded: '<i style="color: #D2C4D5 " class="fa fa-folder-open"/>',
                    groupContracted: '<i style="color: #D2C4D5 " class="fa fa-folder"/>'
                }
            };

            //projectFiles.setActiveDirectory(ctrl.files[0]);
            //$state.go('projects.project.files.all.edit', {file_id: ctrl.files[0].datafile_id, file_type: 'datadir'});
        }


    }
}(angular.module('materialscommons')));
