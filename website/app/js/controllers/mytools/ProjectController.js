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
    $scope.tree_data = [
        {'node': 'Node1', 'text': 'I am parent', 'c_id': '1', 'p_id': '', 'size': '1654', 'date': 'December 10'},
        {'node': 'Node 1.1', 'text': 'Child 1', 'c_id': '1.1', 'p_id': '1', 'size': '56','date': 'January 1'},
        {'node': 'Node2', 'text': 'I am parent', 'c_id': '2', 'p_id': '','size': '500', 'date': 'February 21'}
    ]

    $scope.selected_project = function(proj_id){
        mcapi('/projects/%/tree', proj_id)
            .success(function (data) {
                $scope.project_details = data;
            })
            .error(function (data) {

            }).jsonp();
    }


}

function ProvController($scope, mcapi){




}