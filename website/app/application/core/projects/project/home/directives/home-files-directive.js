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
    ["$scope", "ui", "projectFiles", "applySearch",
        "$filter", "mcapi", homeFilesDirectiveController]);
function homeFilesDirectiveController($scope, ui, projectFiles, applySearch,
                                      $filter, mcapi) {
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
            template: '<i style="color: #BFBFBF;" class="fa fa-fw fa-file"></i><span ng-bind="data.name"></span>'
        },
        {displayName: "", field: "size", width: 250},
        {displayName: "", field: "birthtime", width: 250}
    ];
    var treeModel = new TreeModel(),
        root = treeModel.parse(f);
    root.walk({strategy: 'pre'}, function(node){
        if (node.model.type === 'datadir'){
            node.model.group = true;
            node.model.data = {name: node.model.name, size: node.model.size, birthtime: $filter('toDateString')(node.model.birthtime)};
        }else{
            node.model.group = false;
            node.model.data = {name: node.model.name, size: node.model.size, birthtime: $filter('toDateString')(node.model.birthtime)};
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
        groupInnerCellRenderer: groupInnerCellRenderer
    };
    function groupInnerCellRenderer(params) {
        if (params.node.type === 'datadir') {
            return '' + params.node.name;
        }
        //var image = params.node.level === 0 ? 'disk' : 'folder';
        //var imageFullUrl = '/example-file-browser/' + image + '.png';
        //return '<img src="'+imageFullUrl+'" style="padding-left: 4px;" /> ' + params.data.name;
    }

}
