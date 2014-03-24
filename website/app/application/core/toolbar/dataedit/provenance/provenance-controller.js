
Application.Controllers.controller('toolbarDataEditProvenance',
    ["$scope", "mcapi", "User", "$state", "$stateParams",
        function ($scope, mcapi, User, $state, $stateParams) {

            $scope.init = function () {
                $scope.id = $stateParams.id;
                $scope.ip_conditions = [];
                $scope.op_conditions = [];
                $scope.output_process = [];
                $scope.input_process = [];
                mcapi('/processes/output/datafile/%', $scope.id)
                    .success(function (data) {
                        $scope.output_process = data;
                    }).jsonp();

                mcapi('/processes/input/datafile/%', $scope.id)
                    .success(function (data) {
                        $scope.input_processes = data;
                    }).jsonp();
            };
            $scope.init();
        }]);
