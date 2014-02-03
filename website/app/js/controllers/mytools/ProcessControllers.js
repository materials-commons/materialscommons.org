function ProcessReportController($scope, $stateParams, mcapi) {
    $scope.process_id = $stateParams.process_id;

    mcapi('/processes/%', $scope.process_id)
        .success(function (data) {
            $scope.process = data;
            mcapi('/processes/extract/%/%', $scope.process.id, 'input_files')
                .success(function (data) {
                    $scope.input_files = [];
                    data.forEach(function (item) {
                        $scope.input_files.push(item.right);
                    });
                })
                .error(function (e) {
                }).jsonp();

            mcapi('/processes/extract/%/%', $scope.process.id, 'output_files')
                .success(function (data) {
                    $scope.output_files = [];
                    data.forEach(function (item) {
                        $scope.output_files.push(item.right);
                    });

                })
                .error(function (e) {
                }).jsonp();

            mcapi('/processes/extract/%/%', $scope.process.id, 'input_conditions')
                .success(function (data) {
                    $scope.input_conditions = [];
                    data.forEach(function (item) {
                        $scope.input_conditions.push(item.right);
                    });

                })
                .error(function (e) {
                }).jsonp();

            mcapi('/processes/extract/%/%', $scope.process.id, 'output_conditions')
                .success(function (data) {
                    $scope.output_conditions = [];
                    data.forEach(function (item) {
                        $scope.output_conditions.push(item.right);
                    });

                })
                .error(function (e) {
                }).jsonp();


        })
        .error(function (e) {

        }).jsonp();

    $scope.get_mode_condition = function (cond) {
        $scope.display_condition = cond;
//        var index = '';
//        $scope.all_keys = Object.keys($scope.display_condition);
//        index = $scope.all_keys.indexOf("id");
//        $scope.all_keys.splice(index, 1);
//        index = $scope.all_keys.indexOf("$$hashKey");
//        $scope.all_keys.splice(index, 1);
//        index = $scope.all_keys.indexOf("template");
//        $scope.all_keys.splice(index, 1);
    };
}