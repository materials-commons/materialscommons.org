Application.Controllers.controller("FilesController",
    ["$scope", "projectFiles", "applySearch",
        "pubsub", "mcfile", "$state", "pubsub", FilesController]);
function FilesController($scope, projectFiles, applySearch,
                         $filter, mcfile, $state, pubsub) {

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

    //groupInnerCellRenderer does not have ability to add ng click. So as
    // an alternative i used event listener to display the data directory
    function groupInnerCellRenderer(params) {
        var eCell = document.createElement('span');
        eCell.innerHTML = params.node.displayname;
        eCell.addEventListener('click', function () {
            projectFiles.setActiveDirectory(params.node);
            if ($state.current.name === 'projects.project.files') {
                $state.go('projects.project.files.edit', {'file_id': ''});
            } else {
                pubsub.send('display-directory');
            }

        });
        return eCell;
    }

    function cellClicked(params) {
        projectFiles.setActiveFile(params.node);
        $state.go('projects.project.files.edit', {'file_id': params.node.df_id});
    }

}
