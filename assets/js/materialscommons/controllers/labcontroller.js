function LabController($scope, $http) {
    $scope.mcdb = Mcdb.db();

    $scope.get_lab_data = function (value) {
        $scope.lab_data = $scope.mcdb.query("materialscommons-app", "datagroup_by_usergroups", {key: value});

    }

    $scope.get_utc_obj = function (utc_in_sec) {
        var d = new Date(utc_in_sec * 1000);
        return d;
    }
}