Application.Directives.directive('homeFiles', homeFilesDirective);
function homeFilesDirective() {
    return {
        restrict: "A",
        controller: 'homeFilesDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-files.html'
    };
}

Application.Controllers.controller("homeFilesDirectiveController",
    ["$scope", "projectFiles", "$filter", "$modal", homeFilesDirectiveController]);
function homeFilesDirectiveController($scope, projectFiles, $filter, $modal) {
    var f = projectFiles.model.projects[$scope.project.id].dir;

    // Root is name of project. Have it opened by default.
    f.showDetails = true;
    $scope.files = [f];
    $scope.files[0].expanded = true;
    $scope.files[0].children = $filter('orderBy')($scope.files[0].children, 'displayname');
    $scope.files.showDetails = true;
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

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: $scope.files,
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
            var file = projectFiles.findFileByID($scope.project.id, params.node.df_id);
            file.expanded = params.node.expanded;
            if (!params.node.sorted) {
                file.children = $filter('orderBy')(file.children, 'displayname');
                file.sorted = true;
                $scope.gridOptions.api.onNewRows();
            }
        }else {
            $scope.modal = {
                instance: null,
                item: params.node
            };
            $scope.modal.item.id = params.node.df_id;
            $scope.modal.instance = $modal.open({
                size: 'lg',
                templateUrl: 'application/core/projects/project/home/directives/display-file.html',
                controller: 'ModalInstanceCtrl',
                resolve: {
                    modal: function () {
                        return $scope.modal;
                    },
                    project: function () {
                        return $scope.project;
                    }
                }
            });
        }
    }
}
