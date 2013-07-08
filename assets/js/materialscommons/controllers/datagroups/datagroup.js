
function DataGroupController($scope, $routeParams, cornercouch, $timeout, User){

    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.list = $scope.mcdb.query("materialscommons-app", "all_datagroups");
    $scope.columnCollection = [
        {label: 'Name', map: 'name'},
        {label: 'Type', map: 'type'},
        {label: 'User', map: 'user', isSortable: false},
        {label: 'Parent', map: 'parent'},
        {label: 'Data', map: 'data'},

    ];



    $scope.getData = function(id){
         item = $scope.mcdb.getDoc(id);
         return item;
    }

    $scope.search_by_date = function(){
        $scope.utc_start_date =  Date.parse($scope.myDate)/1000;
        $scope.utc_end_date =  Date.parse($scope.endDate)/1000;
        $scope.search_results = $scope.mcdb.query("materialscommons-app", "items_by_type_and_date");
    }

    $scope.search_by_name = function(){

    }

    $scope.get_utc_obj = function(utc_in_sec){
        var d = new Date(utc_in_sec * 1000);
        return d;
    }

    $scope.data_by_user = function(){
        $scope.user = User.get_username();
        $scope.data_by_user = $scope.mcdb.query("materialscommons-app", "data_by_owner");

    }

    $scope.data_by_lab = function(){

    }
    $scope.myDate= "12-12-2012";
    $scope.endDate= "13-13-2012";







}

