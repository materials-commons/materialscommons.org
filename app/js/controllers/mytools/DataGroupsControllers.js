
function MyDataGroupsController($scope, $routeParams, $window, $http, User) {
    $scope.predicate = 'name';
    $scope.reverse = false;
    $http.jsonp(mcurljsonp('/user/%/datadirs/datafiles', User.u()))
        .success(function (data) {
            $scope.datagroups_by_user = data;
        })
        .error(function (data, status) {
            // Do something
        });

    $scope.getDatagroup = function (datagroupId) {
        if ($scope.dgroupid != datagroupId) {
            var url = mcurljsonp('/user/%/datadir/%', User.u(), datagroupId);
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

function MyDataGroupsTreeController($scope, $http, $location, User) {
    $http.jsonp(mcurljsonp('/user/%/datadirs/tree', User.u()))
        .success(function(tree) {
            $scope.tree = tree;
            //console.dir('tree data :' + $scope.tree);
        })
        .error(function() {
            console.log("Failed to retrieve tree");
        })

    $scope.gotoSelection = function(d) {
        if (d.type == "datafile") {
            $location.path("/data/edit/" + d.id);
        }
    }
}

function MyGroupsDataGroupsTreeController($scope, $http, $location, User) {
    $http.jsonp(mcurljsonp('/user/%/datadirs/tree/groups', User.u()))
        .success(function(tree) {
            $scope.tree = tree;
        })
        .error(function() {
            console.log("Failed to retrieve tree");
        })

    $scope.gotoSelection = function(d) {
        if (d.type == "datafile") {
            $location.path("/data/edit/" + d.id);
        }
    }
}



