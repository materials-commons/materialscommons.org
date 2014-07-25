Application.Controllers.controller('projectsDataEditProvenance',
    ["$scope", "mcapi", "User", "$state", "$stateParams", "$filter",
        function ($scope, mcapi, User, $state, $stateParams, $filter) {

            $scope.init = function () {
                $scope.id = $stateParams.data_id;
                mcapi('/datafile/%', $scope.id)
                    .success(function (data) {
                        $scope.doc = data;
                    }).jsonp();
                $scope.ip_conditions = [];
                $scope.op_conditions = [];
                $scope.output_process = [];
                $scope.input_process = [];
                mcapi('/processes/file/%', $scope.id)
                    .success(function (data) {
                        $scope.df_denorm = data;
                    }).jsonp();
            };
            $scope.init();
        }
    ]);