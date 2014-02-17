Application.Controllers.controller('toolbarMyData',
    ["$scope", "mcapi", "$state", function ($scope, mcapi, $state) {
        $scope.predicate = 'name';
        $scope.reverse = false;
        mcapi('/datafiles')
            .success(function (data) {
                $scope.data_by_user = data;
            }).jsonp();

        $scope.editData = function (id) {
            $state.go("toolbar.dataedit", {id: id});
        }

        $scope.get_dg = function (dg) {
            mcapi('/datadir/%', dg)
                .success(function (data) {
                    $scope.dir = data;
                })
                .error(function (data) {
                    alertService.sendMessage(data.error);
                }).jsonp();
        }

    }]);