Application.Controllers.controller("FilesAllController",
    ["$scope", "projectFiles", "mcfile", "$state", "pubsub", FilesAllController]);
function FilesAllController($scope, projectFiles, mcfile, $state, pubsub) {
    var f = projectFiles.model.projects[$scope.project.id].dir;

    // Root is name of project. Have it opened by default.
    $scope.files = [f];

    pubsub.waitOn($scope, 'files.refresh', function() {
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
                return '<i style="color: #BFBFBF;"  class="fa fa-fw fa-file"></i><span>' +
                    '<a data-toggle="tooltip" data-placement="top" title="{{params.node.name}}">' +
                    params.node.name + '</a></span>';
            }
        }];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: $scope.files,
        rowSelection: 'multiple',
        rowsAlreadyGrouped: true,
        rowClicked: rowClicked,
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
        var eCell = document.createElement('span');
        eCell.innerHTML = params.node.displayname;
        return eCell;
    }

    function rowClicked(params) {
        if (params.node.type == 'datadir') {
            projectFiles.setActiveDirectory(params.node)
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

