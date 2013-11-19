function MyDataGroupsController($scope, mcapi) {
    $scope.predicate = 'name';
    $scope.reverse = false;

    mcapi('/datadirs/datafiles')
        .success(function (data) {
            $scope.datagroups_by_user = data;
        }).jsonp();

    $scope.getDatagroup = function (datagroupId) {
        if ($scope.dgroupid != datagroupId) {
            mcapi('/datadir/%', datagroupId)
                .arg('order_by=name')
                .success(function (data) {
                    $scope.dgroup = data;
                    $scope.dgroupid = data.id;
                }).jsonp();
        }
    }
}

function SearchByDateController($scope) {
    $scope.search_by_date = function () {
        //$scope.utc_start_date = Date.parse($scope.startDate) / 1000;
        //$scope.utc_end_date = Date.parse($scope.endDate) / 1000;

    }
}

function MyDataGroupsTreeController($scope, mcapi, $location, treeToggle) {
    mcapi('/datadirs/tree')
        .success(function (tree) {
            $scope.tree = tree;
            $scope.selected = treeToggle.get_all();
        })
        .error(function () {
        }).jsonp();

    $scope.gotoSelection = function (d) {
        if (d.type == "datafile") {
            $location.path("/data/edit/" + d.id);
        }
    }
}

function MyGroupsDataGroupsTreeController($scope, mcapi, $location) {
    mcapi('/datadirs/tree/groups')
        .success(function (tree) {
            $scope.tree = tree;
        })
        .error(function () {
        }).jsonp();

    $scope.gotoSelection = function (d) {
        if (d.type == "datafile") {
            $location.path("/data/edit/" + d.id);
        }
    }
}

function DataDirReportController($scope,  $location, mcapi, $stateParams) {
    $scope.get_full_data_with_id = function (id) {
        //$location.path("/data/data/" + id);
    }

    if ($stateParams.id) {
        mcapi('/datadir/%', $stateParams.id)
            .arg('order_by=name')
            .success(function (data) {
                $scope.data_dir = data;
                mcapi('/datafile/ids/%', $stateParams.id)
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