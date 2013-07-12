
function DataGroupController($scope, $routeParams, cornercouch, User, $timeout, $rootScope, $location){

    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.data_by_user = $scope.mcdb.query("materialscommons-app", "data_by_owner", {startkey: [User.get_username()], endkey:[User.get_username(), "public"]});
    $scope.list = $scope.mcdb.query("materialscommons-app", "all_datagroups");
    $scope.predicate = 'user';
    /*
    $scope.columnCollection = [
        {label: 'Name', map: 'name'},
        {label: 'Type', map: 'type'},
        {label: 'User', map: 'user', isSortable: false},
        {label: 'Parent', map: 'parent'},
        {label: 'Data', map: 'data'},

    ];
     */
    if ($scope.each_parent_id){
        $scope.item = $scope.mcdb.getDoc($scope.each_parent_id);
    }

    $scope.myValueFunction = function(row) {
      // console.log($scope.predicate);
      //  return row.value.users[0];
    };

    /*
    if ($routeParams.subpage == "data_item"){
       // alert($routeParams.each_parent_id);
        $scope.item = $scope.mcdb.getDoc($routeParams.each_parent_id);
        //$scope.datagroup = $routeParams.each_parent_id;
        //$scope.datagroup = $scope.getData($routeParams.each_parent_id);

    }

    $scope.display_parent = function (each_parent_id) {
        $location.path("/parent/data_item/" + each_parent_id);
    }
    */

    $scope.getData = function(id){
         item = $scope.mcdb.getDoc(id);
         return item;
    }

    $scope.search_by_date = function(){
        $scope.utc_start_date =  Date.parse($scope.myDate)/1000;
        $scope.utc_end_date =  Date.parse($scope.endDate)/1000;
        $scope.search_results = $scope.mcdb.query("materialscommons-app", "items_by_type_and_date");
    }



    $scope.get_utc_obj = function(utc_in_sec){
        var d = new Date(utc_in_sec * 1000);
        return d;
    }



    $scope.data_by_lab = function(){

    }



    $scope.myDate= "12-12-2012";
    $scope.endDate= "13-13-2012";







}

