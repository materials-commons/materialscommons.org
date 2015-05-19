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
        "$filter", "Review", "pubsub", "$modal", modalFilesDirectiveController]);
function modalFilesDirectiveController($scope, projectFiles, $filter, Review, pubsub, $modal) {
    var f = projectFiles.model.projects[$scope.project.id].dir;
    // Root is name of project. Have it opened by default.
    f.showDetails = true;
    $scope.files = [f];
    $scope.files.showDetails = true;
    var columnDefs = [
        {
            displayName: "",
            field: "name",
            width: 350,
            checkboxSelection: true,
            cellClicked: cellClickedFunc,
            //template: '<i style="color: #BFBFBF;" class="fa fa-fw fa-file"></i><span>' +
            //'<a data-toggle="tooltip" data-placement="top" title="{{displayname}}">ABC</a></span>'
            cellRenderer: function (params) {
                return '<i style="color: #BFBFBF;" class="fa fa-fw fa-file"></i><span>' +
                    '<a data-toggle="tooltip" data-placement="top" title="{{params.node.name}}">' +
                    params.node.name + '</a></span>';
            }

        },
        {
            displayName: "", field: "size", width: 250, cellRenderer: function (params) {
            if (params.node.size === 0) {
                return '';
            } else {
                return parseInt(params.node.size / 1024) + ' mb';
            }
        }
        },
        {
            displayName: "", field: "birthtime", width: 250,
            cellRenderer: function (params) {
                return $filter('toDateString')(params.node.birthtime);
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
        suppressRowClickSelection: true,
        rowSelected: checkboxClickedFunc,
        groupInnerCellRenderer: groupInnerCellRenderer
    };
    function groupInnerCellRenderer(params) {
        var template = params.node.type === 'datadir' ? params.node.displayname : 'File';
        return template;
    }

    function checkboxClickedFunc(params) {
        Review.checkedItems(params);
        pubsub.send('addFileToReview', params);
    }

    function cellClickedFunc(params) {
        $scope.modal = {
            instance: null,
            items: [params.node]
        };

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
