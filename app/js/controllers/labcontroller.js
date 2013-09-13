function LabController($scope, mcjsonp) {
    mcjsonp('/usergroups')
        .success(function (data) {
            $scope.labs = data;
        }).error(function (data, status) {
            console.dir(status);
        });


    $scope.get_lab_data = function (value) {
        mcjsonp('/usergroup/%/datafiles', value)
            .success(function (data) {
                $scope.lab_data = data;
            })
    }

    $scope.get_utc_obj = function (utc_in_sec) {
        var d = new Date(utc_in_sec * 1000);
        return d;
    }
}
