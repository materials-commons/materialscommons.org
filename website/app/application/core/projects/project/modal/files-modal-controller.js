Application.Directives.directive('modalFiles', modalFilesDirective);
function modalFilesDirective() {
    return {
        restrict: "A",
        controller: 'modalFilesDirectiveController',
        scope: {
            project: '=project'

        },
        templateUrl: 'application/core/projects/project/modal/files-modal.html'
    };
}

Application.Controllers.controller("modalFilesDirectiveController",
    ["$scope", "projectFiles",
        "$filter", "Review", "pubsub", "$modal", "mcapi", modalFilesDirectiveController]);
function modalFilesDirectiveController($scope, projectFiles, $filter, Review, pubsub, $modal, mcapi) {
    $scope.showTree = true;
    $scope.search = search;

    var f = projectFiles.model.projects[$scope.project.id].dir;
    f.showDetails = true;
    $scope.files = [f];
    $scope.files[0].expanded = true;
    $scope.files[0].children = $filter('orderBy')($scope.files[0].children, 'displayname');
    $scope.files.showDetails = true;
    var columnDefs = [

        {
            displayName: "",
            field: "name",
            width: 550,
            checkboxSelection: true,
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
        rowSelected: function (row) {
            Review.checkedItems(row);
            pubsub.send('addFileToReview', row);
        },
        suppressRowClickSelection: true,
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
        } else {
            $scope.modal = {
                instance: null,
                item: params.node
            };
            //The project tree is not compatible with the actual
            // datafile object. So i modified some field types
            // so that display-file MODAL can be used every
            // where to display information about file
            $scope.modal.item.mediatype = {
                mime: params.node.mediatype
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

    function search() {
        mcapi("/search/project/%/files", $scope.project.id)
            .success(function (results) {
                $scope.showTree = false;
                $scope.results = results;
            })
            .post({query_string: $scope.query});
    }

}
