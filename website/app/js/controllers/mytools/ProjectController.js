function ListProjectsController($scope, mcapi) {
    mcapi('/projects')
        .success(function (data) {
            $scope.projects = data;
        })
        .error(function (data) {

        }).jsonp();

    $scope.clicked = function () {
        $scope.clicked = true;
    }

    $scope.selected_project = function(proj_id) {

        mcapi('/projects/%/tree', proj_id)
            .success(function (data) {
                $scope.tree_data = $scope.flattenTree(data);

            })
            .error(function (data) {

            }).jsonp();
    }

    $scope.flattenTree = function (tree) {
        var flatTree = [],
            treeModel = new TreeModel(),
            root = treeModel.parse(tree[0]);
        root.walk({strategy: 'pre'}, function (node) {
            flatTree.push(node.model);
        });
        return flatTree;
    };


}
