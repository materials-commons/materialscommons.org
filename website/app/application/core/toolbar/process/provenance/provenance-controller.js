Application.Controllers.controller('toolbarProcessProvenance',
    ["$scope", "mcapi", "User", "$state", "$stateParams",
        function ($scope, mcapi, User, $state, $stateParams) {

            $scope.init = function () {
                $scope.id = $stateParams.id;
                $scope.output_properties = [];
                $scope.input_properties = [];
                $scope.input_files = [];
                $scope.output_files = [];
                mcapi('/processes/%', $scope.id)
                    .success(function (data) {
                        $scope.process = data;
                        $scope.input_files = $scope.process.input_files;
                        $scope.output_files = $scope.process.output_files;
                        if ($scope.process.input_conditions.length !== 0) {
                            mcapi('/processes/extract/%/%', $scope.process.id, "input_conditions")
                                .success(function (data) {
                                    $scope.input_properties = data;
                                })
                                .error(function (e) {

                                }).jsonp();
                        }
                        if ($scope.process.output_conditions.length !== 0) {
                            mcapi('/processes/extract/%/%', $scope.process.id, "output_conditions")
                                .success(function (data) {
                                    $scope.output_properties = data;
                                })
                                .error(function (e) {

                                }).jsonp();
                        }
                    }).jsonp();
            };
            $scope.init();
        }]);