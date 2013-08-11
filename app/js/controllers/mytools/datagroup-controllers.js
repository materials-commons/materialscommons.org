
function MyDataGroupsController($scope, $routeParams, $window, $http, User) {
    $scope.predicate = 'name';
    $scope.reverse = false;
    $http.jsonp(mcurljsonp('/user/%/datagroups/data', User.u()))
        .success(function (data) {
            $scope.datagroups_by_user = data;
        })
        .error(function (data, status) {
            // Do something
        });

    $scope.getDatagroup = function (datagroupId) {
        if ($scope.dgroupid != datagroupId) {
            var url = mcurljsonp('/user/%/datagroup/%', User.u(), datagroupId);
            $http.jsonp(url)
                .success(function (data) {
                    $scope.dgroup = data;
                    $scope.dgroupid = data.id;
                });
        }
    }
}

function SearchByDateController($scope, $http, $routeParams, User) {
    console.log("SearchByDateController");
    $scope.search_by_date = function () {
        console.log($scope.myDate);
        $scope.utc_start_date = Date.parse($scope.myDate) / 1000;
        $scope.utc_end_date = Date.parse($scope.endDate) / 1000;
        //$scope.search_results = $scope.mcdb.query("materialscommons-app", "items_by_type_and_date");
    }
}



