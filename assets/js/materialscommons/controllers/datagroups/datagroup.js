
function DataGroupController($scope, $routeParams, cornercouch, $timeout){
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.list = $scope.mcdb.query("materialscommons-app", "all_datagroups");

    $scope.getData = function(id){
         item = $scope.mcdb.getDoc(id);
         return item;
    }

    $scope.search_by_date = function(){
        $scope.utc_start_date =  Date.parse($scope.myDate)/1000;
        $scope.utc_end_date =  Date.parse($scope.endDate)/1000;
        $scope.search_results = $scope.mcdb.query("materialscommons-app", "items_with_type_and_date");
    }

    $scope.get_utc_obj = function(utc_in_sec){
        var d = new Date(utc_in_sec * 1000);
        return d;
    }

    $scope.myDate= "12-12-2012";
    $scope.endDate= "13-13-2012";

}

