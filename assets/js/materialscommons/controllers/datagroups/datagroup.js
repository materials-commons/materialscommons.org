function DataGroupController($scope, cornercouch, User, $location) {

    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.data_by_user = $scope.mcdb.query("materialscommons-app", "data_by_owner",{startkey: [User.get_username()], endkey: [User.get_username(), "public"]});
    $scope.datagroup_by_user = $scope.mcdb.query("materialscommons-app", "datagroup_by_user",{startkey: [User.get_username()], endkey: [User.get_username(), "public"]});


    //$scope.data_with_datagroups = $scope.mcdb.query("materialscommons-app", "data_with_datagroups");
    //alert(User.get_username());
    //$scope.list = $scope.mcdb.query("materialscommons-app", "all_datagroups");
    $scope.predicate = 'user';

    $scope.myDate = "01-01-2013";
    $scope.endDate = "09-12-2013";


    if ($scope.each_parent_id) {
        $scope.item = $scope.mcdb.getDoc($scope.each_parent_id);
    }

    $scope.getData = function (id) {
        item = $scope.mcdb.getDoc(id);
        return item;
    }

    $scope.search_by_date = function () {
        $scope.utc_start_date = Date.parse($scope.myDate) / 1000;
        $scope.utc_end_date = Date.parse($scope.endDate) / 1000;
        $scope.search_results = $scope.mcdb.query("materialscommons-app", "items_by_type_and_date");
    }


    $scope.get_utc_obj = function (utc_in_sec) {
        var d = new Date(utc_in_sec * 1000);
        return d;
    }


    $scope.data_by_lab = function () {

    }


    $scope.editData = function(value) {
        if (value.type == "data") {
            $location.path("/data/edit/" + value._id);
        }
    }

    $scope.one_query = function(id){
        $scope.result = $scope.mcdb.query("materialscommons-app", {start_key: [id, User.get_username()] , endkey: [id, User.get_username(), 1]});
        return $scope.result;
    }
}



