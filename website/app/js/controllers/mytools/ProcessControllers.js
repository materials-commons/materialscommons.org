function ProcessReportController($scope, $stateParams, mcapi) {
    $scope.process_id = $stateParams.process_id;

    mcapi('/processes/%', $scope.process_id)
        .success(function (data) {
            $scope.process = data;
            mcapi('/processes/datafiles/%', $scope.process.id)
                .success(function(data){
                    $scope.input_files = data
                })
        })
        .error(function (e) {

        }).jsonp();

}