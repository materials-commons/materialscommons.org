function ListProjectsController($scope, mcapi) {
    mcapi('/projects')
        .success(function (data) {
            $scope.projects = data
        })
        .error(function (data) {

        }).jsonp()

    $scope.clicked = function () {
        $scope.clicked = true;
    }
    $scope.tree_data = [
        {'node': 'Node1', 'text': 'I am parent', 'c_id': '1', 'p_id': '', 'size': '1654', 'date': 'December 10'},
        {'node': 'Node 1.1', 'text': 'Child 1', 'c_id': '1.1', 'p_id': '1', 'size': '56','date': 'January 1'},
        {'node': 'Node2', 'text': 'I am parent', 'c_id': '2', 'p_id': '','size': '500', 'date': 'February 21'}
    ]

//
//    //$scope.gridOptions = {data: 'processes'};
//    $scope.selected_project = function (id) {
//        $scope.tree_data = [
//            {'node': 'Node1', 'text': 'I am parent', 'c_id': '1', 'p_id': ''},
//            {'node': 'Node 1.1', 'text': 'Child 1', 'c_id': '1.1', 'p_id': '1'},
//            {'node': 'Node2', 'text': 'I am parent', 'c_id': '2', 'p_id': ''}
//        ]
////        mcapi('/projects/%/datadirs/tree', id)
////            .success(function (data) {
////                $scope.project_tree = data;
////                mcapi('/processes/project/%',id)
////                    .success(function(process_data){
////                        $scope.processes = process_data;
////                        console.dir($scope.processes);
////                        $scope.gridOptions = { data: 'processes' }
////
////                    })
////                    .error(function(){
////
////                    }).jsonp();
////            })
////            .error(function () {
////
////            }).jsonp()
//
//
//    }



}

function ProvController($scope, mcapi){




}