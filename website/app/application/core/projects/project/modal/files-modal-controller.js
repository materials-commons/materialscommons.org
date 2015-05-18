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
            field: "displayname",
            width: 350 ,
            checkboxSelection: true,
            cellClicked: cellClickedFunc,
            template: '<i style="color: #BFBFBF;" class="fa fa-fw fa-file"></i><span>' +
            '<a data-toggle="tooltip" data-placement="top" title="{{data.name}}">{{data.name | truncate:15:"...":true }}</a></span>'

        },
        {
            displayName: "", field: "size", width: 250, cellRenderer: function (params) {
            if (params.data.size === 0) {
                return '';
            } else {
                return parseInt(params.data.size / 1024) + ' mb';
            }
        }
        },
        {displayName: "", field: "birthtime", width: 250}
    ];
    var treeModel = new TreeModel(),
        root = treeModel.parse(f);

    root.walk({strategy: 'pre'}, function (node) {
        if (node.model.type === 'datadir') {
            node.model.group = true;
            node.model.data = {
                name: node.model.displayname,
                size: node.model.size,
                type: node.model.type,
                birthtime: $filter('toDateString')(node.model.birthtime)
            };
        } else {
            node.model.group = false;
            node.model.data = {
                name: node.model.name,
                size: node.model.size,
                type: node.model.type,
                birthtime: $filter('toDateString')(node.model.birthtime),
                mediatype: node.model.mediatype,
                id: node.model.df_id,
                tags: node.model.tags,
                owner: node.model.owner,
                notes: node.model.notes
            };
        }
    });
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
        rowSelected: function (file) {
            Review.checkedItems(file);
            pubsub.send('addFileToReview', file);
        },
        groupInnerCellRenderer: groupInnerCellRenderer
        //groupSelection: true,
        //groupCheckboxSelection: 'group',
        //groupUseEntireRow: false
    };
    function groupInnerCellRenderer(params) {
        var template = params.data.type === 'datadir' ? params.data.name : 'File';
        return template;
    }

    function cellClickedFunc(params) {
        $scope.modal = {
            instance: null,
            items: [params.data]
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
