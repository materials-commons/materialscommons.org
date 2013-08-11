function LabController($scope, $http) {
    $http.jsonp(mcurljsonp('/usergroups'))
        .success(function(data) {
            console.log("retrieved labs");
            $scope.labs = data;
        }).error(function(data, status) {
            console.dir(status);
        });


    $scope.get_lab_data = function (value) {
        $http.jsonp(mcurljsonp('/usergroup/%/data', value))
            .success(function(data) {
                $scope.lab_data = data;
            })
    }

    $scope.get_utc_obj = function (utc_in_sec) {
        var d = new Date(utc_in_sec * 1000);
        return d;
    }
}
