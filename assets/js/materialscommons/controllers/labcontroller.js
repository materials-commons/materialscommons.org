function LabController($scope, Mcdb){
    $scope.mcdb = Mcdb.db();



    $scope.get_lab_data = function(value){
        $scope.lab_data = $scope.mcdb.query("materialscommons-app", "datagroup_by_usergroups", {key:value});

    }

}