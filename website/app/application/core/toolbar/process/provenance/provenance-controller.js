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
                        $scope.input_files = $scope.process.inputs
                    }).jsonp();
            };
            $scope.init();
        }]);