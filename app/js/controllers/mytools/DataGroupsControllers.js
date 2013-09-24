function MyDataGroupsController($scope, mcapi, User) {
    $scope.predicate = 'name';
    $scope.reverse = false;

    mcapi('/user/%/datadirs/datafiles', User.u())
        .success(function (data) {
            $scope.datagroups_by_user = data;
        })
        .error(function (data, status) {

        }).jsonp();

    $scope.getDatagroup = function (datagroupId) {
        if ($scope.dgroupid != datagroupId) {
            mcapi('/user/%/datadir/%', User.u(), datagroupId)
                .arg('order_by=name')
                .success(function (data) {
                    $scope.dgroup = data;
                    $scope.dgroupid = data.id;
                }).jsonp();
        }
    }
}

function SearchByDateController($scope, $routeParams, User) {
    $scope.search_by_date = function () {
        $scope.utc_start_date = Date.parse($scope.myDate) / 1000;
        $scope.utc_end_date = Date.parse($scope.endDate) / 1000;
    }
}

function MyDataGroupsTreeController($scope, mcapi, $location, User) {
    mcapi('/user/%/datadirs/tree', User.u())
        .success(function (tree) {
            $scope.tree = tree;
            //console.dir('tree data :' + $scope.tree);
        })
        .error(function () {
            console.log("Failed to retrieve tree");
        }).jsonp();

    $scope.gotoSelection = function (d) {
        if (d.type == "datafile") {
            $location.path("/data/edit/" + d.id);
        }
    }
}

function MyGroupsDataGroupsTreeController($scope, mcapi, $location, User) {
    mcapi('/user/%/datadirs/tree/groups', User.u())
        .success(function (tree) {
            $scope.tree = tree;
        })
        .error(function () {
            console.log("Failed to retrieve tree");
        }).jsonp();

    $scope.gotoSelection = function (d) {
        if (d.type == "datafile") {
            $location.path("/data/edit/" + d.id);
        }
    }
}

function DataDirReportController($scope, $routeParams, $location, mcapi, User) {
    $scope.get_full_data_with_id = function (id) {
        $location.path("/data/data/" + id);
    }

    if ($routeParams.id) {
        mcapi('/user/%/datadir/%', User.u(), $routeParams.id)
            .arg('order_by=name')
            .success(function (data) {
                $scope.data_dir = data;
                mcapi('/user/%/datafile/ids/%', User.u(), $routeParams.id)
                    .success(function (datafiles) {
                        $scope.datafiles = datafiles;
                    })
                    .error(function () {
                    }).jsonp();
            })
            .error(function () {
            }).jsonp();
    }
}



