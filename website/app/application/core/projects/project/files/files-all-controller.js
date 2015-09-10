(function (module) {
    module.controller("FilesAllController", FilesAllController);

    FilesAllController.$inject = ["$scope", "projectFiles", "project", "mcfile", "$state", "pubsub", "$filter"];

    /* @ngInject */
    function FilesAllController($scope, projectFiles, project, mcfile, $state, pubsub, $filter) {
        var ctrl = this;

        var f = projectFiles.model.projects[project.id].dir;

        // Root is name of project. Have it opened by default.
        ctrl.files = [f];
        ctrl.files[0].expanded = true;
        ctrl.files[0].children = $filter('orderBy')(ctrl.files[0].children, 'displayname');

        pubsub.waitOn($scope, 'files.refresh', function () {
            ctrl.gridOptions.api.recomputeAggregates();
            ctrl.gridOptions.api.refreshGroupRows();
            ctrl.gridOptions.api.refreshView();
        });

        ctrl.fileSrc = fileSrc;

        init();

        ///////////////////////////////

        function fileSrc(file) {
            return mcfile.src(file.id);
        }

        function groupInnerCellRenderer(params) {
            var eCell = document.createElement('span');
            eCell.innerHTML = params.node.displayname;
            return eCell;
        }

        function rowClicked(params) {
            if (params.node.type == 'datadir') {
                projectFiles.setActiveDirectory(params.node);
                var file = projectFiles.findFileByID(project.id, params.node.datafile_id);
                file.expanded = params.node.expanded;
                if (!params.node.sorted) {
                    file.children = $filter('orderBy')(file.children, 'displayname');
                    file.sorted = true;
                    ctrl.gridOptions.api.onNewRows();
                }
            } else {
                projectFiles.setActiveFile(params.node);
            }
            $state.go('projects.project.files.all.edit', {
                file_id: params.node.datafile_id,
                file_type: params.node.type
            });
        }

        function init() {
            var columnDefs = [
                {
                    displayName: "",
                    field: "name",
                    width: 350,
                    cellRenderer: function (params) {
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
                }];

            ctrl.gridOptions = {
                columnDefs: columnDefs,
                rowData: ctrl.files,
                rowsAlreadyGrouped: true,
                rowClicked: rowClicked,
                enableColResize: false,
                enableSorting: false,
                rowHeight: 30,
                angularCompileRows: false,
                icons: {
                    groupExpanded: '<i style="color: #D2C4D5 " class="fa fa-folder-open"/>',
                    groupContracted: '<i style="color: #D2C4D5 " class="fa fa-folder"/>'
                },
                groupInnerCellRenderer: groupInnerCellRenderer
            };

            projectFiles.setActiveDirectory(ctrl.files[0]);
            $state.go('projects.project.files.all.edit', {file_id: ctrl.files[0].datafile_id, file_type: 'datadir'});
        }


    }
}(angular.module('materialscommons')));
