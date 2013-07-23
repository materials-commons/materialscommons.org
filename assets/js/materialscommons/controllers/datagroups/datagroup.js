function DataGroupController($scope, cornercouch, User, $location) {

    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.data_by_user = $scope.mcdb.query("materialscommons-app", "data_by_owner",{startkey: [User.get_username()], endkey: [User.get_username(), "public"]});
    $scope.datagroup_by_user = $scope.mcdb.query("materialscommons-app", "datagroup_by_user",{startkey: [User.get_username()], endkey: [User.get_username(), "public"]});

    $scope.predicate = 'name';
    //$scope.data_with_datagroups = $scope.mcdb.query("materialscommons-app", "data_with_datagroups");
    //alert(User.get_username());
    //$scope.list = $scope.mcdb.query("materialscommons-app", "all_datagroups");
    $scope.predicate = 'user';

    $scope.myDate = "06/25/2013";
    $scope.endDate = "07/25/2013";
    $scope.type="data";

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
















    $scope.mcdb.query("materialscommons-app", "datagroup_by_user",{startkey: [User.get_username()],
        endkey: [User.get_username(), "public"]}).success(function(){

        $scope.columnCollection = [
            {label: 'Name', map: 'name'},
            {label: 'CreatedAt', map: 'dateAdded'},
            {label: 'Data', map:''}
        ];

        $scope.globalConfig = {
            isPaginationEnabled: true,
            isGlobalSearchActivated: true,
            itemsByPage: 10,
            selectionMode: 'single'
        };

        if ($scope.mcdb.rows.length > 0) {
            $scope.rowCollection = [];
            angular.forEach($scope.mcdb.rows, function(row){
                //console.log(row);

                if (row.value.data.length > 0){

                }
                $scope.rowCollection.push({name: row.value.name, dateAdded: row.value.dateAdded,
                    ParentDataGroup: row.value.parentDataGroups});

            });
        }
    });
























}



