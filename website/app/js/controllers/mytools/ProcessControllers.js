function ProcessReportController($scope, mcapi) {

    $scope.selected_process = function (id) {

        mcapi('/processes/%', id)
            .success(function (data) {
                $scope.process = data;
                console.log($scope.process);
            })
            .error(function (e) {

            }).jsonp();

    }

}