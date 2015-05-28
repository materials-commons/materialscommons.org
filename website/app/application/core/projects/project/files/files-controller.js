Application.Controllers.controller("FilesController",
    ["$scope", "projectFiles", "applySearch",
        "pubsub", "mcfile", "$state", FilesController]);
function FilesController($scope, projectFiles, applySearch,
                         $filter, mcfile, $state) {
    var f = projectFiles.model.projects[$scope.project.id].dir;

    // Root is name of project. Have it opened by default.
    $scope.files = [f];

    applySearch($scope, "searchInput", applyQuery);


    function applyQuery() {
        var search = {
            name: ""
        };

        if ($scope.searchInput === "") {
            $scope.files = [projectFiles.model.projects[$scope.project.id].dir];
        } else {
            var filesToSearch = projectFiles.model.projects[$scope.project.id].byMediaType.all;
            search.name = $scope.searchInput;
            $scope.files = $filter('filter')(filesToSearch, search);
        }
    }

    $scope.fileSrc = function (file) {
        return mcfile.src(file.id);
    };
    var columnDefs = [
        {
            displayName: "",
            field: "name",
            width: 350,
            cellClicked: cellClicked,
            cellRenderer: function (params) {
                return '<i style="color: #BFBFBF;" class="fa fa-fw fa-file"></i><span>' +
                    '<a data-toggle="tooltip" data-placement="top" title="{{params.node.name}}">' +
                    params.node.name + '</a></span>';
            }
        }
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: $scope.files,
        rowSelection: 'multiple',
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
        var template = params.node.type === 'datadir' ? params.node.displayname : 'File';
        return template;
    }
    function cellClicked(params) {
        projectFiles.setActiveFile(params.node);
        $state.go('projects.project.files.edit', {'file_id': params.node.df_id});
    }

}
