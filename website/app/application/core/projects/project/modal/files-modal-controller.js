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
        "$filter", "Review", "pubsub", modalFilesDirectiveController]);
function modalFilesDirectiveController($scope, projectFiles, $filter, Review, pubsub) {
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
            checkboxSelection: true
            //template: '<i style="color: #BFBFBF;" class="fa fa-fw fa-file"></i><span ng-bind="data.name"></span>'
        },
        {displayName: "", field: "size", width: 150},
        {displayName: "", field: "birthtime", width: 250}
    ];
    var treeModel = new TreeModel(),
        root = treeModel.parse(f);

    root.walk({strategy: 'pre'}, function (node) {
        if (node.model.type === 'datadir') {
            node.model.group = true;
            node.model.data = {
                name: node.model.name,
                displayname: node.model.displayname,
                size: node.model.size,
                birthtime: $filter('toDateString')(node.model.birthtime),
                id: node.model.id
            };
        } else {
            node.model.group = false;
            node.model.data = {
                name: node.model.name,
                size: node.model.size,
                displayname: node.model.displayname,
                birthtime: $filter('toDateString')(node.model.birthtime),
                id: node.model.id
                //selected: node.model.selected
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
        //ready: readyFunc1,
        icons: {
            groupExpanded: '<i style="color: #D2C4D5 " class="fa fa-folder-open"/>',
            groupContracted: '<i style="color: #D2C4D5 " class="fa fa-folder"/>'

        },
        suppressRowClickSelection: true,
        rowSelected: function (file) {
            Review.checkedItems(file);
            pubsub.send('addFileToReview', file);
        },
        groupInnerCellRenderer: groupInnerCellRenderer,
        groupSelection: true,
        groupCheckboxSelection: 'group',
        groupUseEntireRow: false
    };
    function groupInnerCellRenderer(params) {
        if (params.node.type === 'datadir') {
            return params.node.displayname;
        } else {
            return 'ABCCCC';
        }
    }

    //function readyFunc1() {
    //    var i;
    //    var checked_entries = Review.getCheckedItems();
    //    checked_entries.forEach(function (entry) {
    //        console.log(entry);
    //        i = _.indexOf($scope.files, function (item) {
    //            console.dir(item);
    //            return item.id === entry.id;
    //        });
    //        if (i > -1) {
    //            console.log('yes');
    //            $scope.gridOptions.api.selectIndex(i, true, true);
    //        }
    //    });
    //}

}
