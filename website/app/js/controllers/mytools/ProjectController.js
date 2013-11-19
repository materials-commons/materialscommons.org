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



    $scope.gridOptions = {data: 'processes'};
    $scope.selected_project = function (id) {
        mcapi('/projects/%/datadirs/tree', id)
            .success(function (data) {
                $scope.project_tree = data;
                console.log($scope.project_tree)
                mcapi('/processes/project/%',id)
                    .success(function(process_data){
                        $scope.processes = process_data;
                        console.dir($scope.processes);
                        $scope.gridOptions = { data: 'processes' }

                    })
                    .error(function(){

                    }).jsonp();
            })
            .error(function () {

            }).jsonp()

    }

}