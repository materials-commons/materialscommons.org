
function SearchByDateController($scope) {
    $scope.search_by_date = function () {
        //$scope.utc_start_date = Date.parse($scope.startDate) / 1000;
        //$scope.utc_end_date = Date.parse($scope.endDate) / 1000;

    }
}

function DataDirReportController($scope,  $location, mcapi, $stateParams) {
    $scope.get_full_data_with_id = function (id) {
        //$location.path("/data/data/" + id);
    }

    if ($stateParams.id) {
        mcapi('/datadir/%', $stateParams.id)
            .arg('order_by=name')
            .success(function (data) {
                $scope.data_dir = data;
                mcapi('/datafile/ids/%', $stateParams.id)
                    .success(function (datafiles) {
                        $scope.datafiles = datafiles;
                    })
                    .error(function () {
                    }).jsonp();
            })
            .error(function () {
            }).jsonp();
    }
}