Application.Controllers.controller("FilesAllController",
    ["$scope", "projectFiles", "mcfile", "$state", "pubsub", "$filter", FilesAllController]);
function FilesAllController($scope, projectFiles, mcfile, $state, pubsub, $filter) {
    var f = projectFiles.model.projects[$scope.project.id].dir;

    // Root is name of project. Have it opened by default.
    $scope.files = [f];
    $scope.files[0].expanded = true;
    $scope.files[0].children = $filter('orderBy')($scope.files[0].children, 'displayname');

    pubsub.waitOn($scope, 'files.refresh', function () {
        $scope.gridOptions.api.recomputeAggregates();
        $scope.gridOptions.api.refreshGroupRows();
        $scope.gridOptions.api.refreshView();
    });

    $scope.fileSrc = function (file) {
        return mcfile.src(file.id);
    };

    var columnDefs = [
        {
            displayName: "",
            field: "name",
            width: 350,
            cellRenderer: function (params) {
                var icon = "fa-file";
                switch (params.node.mediatype) {
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
                    if (isImage(params.node.mediatype)) {
                        icon = "fa-file-image-o";
                    }
                    break;
                }
                return '<i style="color: #D2C4D5;" class="fa fa-fw ' + icon + '"></i><span title="' + params.node.name + '">' +
                    '<a data-toggle="tooltip" data-placement="top">' +
                    params.node.name + '</a></span>';
            }
        }];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: $scope.files,
        //rowSelection: 'multiple',
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

    function groupInnerCellRenderer(params) {
        var eCell = document.createElement('span');
        eCell.innerHTML = params.node.displayname;
        return eCell;
    }

    function rowClicked(params) {
        if (params.node.type == 'datadir') {
            projectFiles.setActiveDirectory(params.node);
            var file = projectFiles.findFileByID($scope.project.id, params.node.df_id);
            file.expanded = params.node.expanded;
            if (!params.node.sorted) {
                file.children = $filter('orderBy')(file.children, 'displayname');
                file.sorted = true;
                $scope.gridOptions.api.onNewRows();
            }
        } else {
            projectFiles.setActiveFile(params.node);
        }
        $state.go('projects.project.files.all.edit', {file_id: params.node.df_id, file_type: params.node.type});
    }

    function init() {
        projectFiles.setActiveDirectory($scope.files[0]);
        $state.go('projects.project.files.all.edit', {file_id: $scope.files[0].df_id, file_type: 'datadir'});
    }

    init();
}

