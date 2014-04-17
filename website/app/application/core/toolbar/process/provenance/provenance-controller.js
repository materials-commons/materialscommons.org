Application.Controllers.controller('toolbarProcessProvenance',
    ["$scope", "mcapi", "User", "$state", "$stateParams", "$filter",
        function ($scope, mcapi, User, $state, $stateParams, $filter) {

            $scope.showtab = function (tab, type) {
                switch (type) {
                    case "id":
                        mcapi('/objects/%', tab.properties.id.value)
                            .success(function (data) {
                                $scope.item = data;
                            }).jsonp();
                        break;
                    case "condition":
                        $scope.item = tab;
                        break;
                    case "file":
                        mcapi('/datafile/%', tab.properties.id.value)
                            .success(function (data) {
                                $scope.item = data;
                            }).jsonp();
                        break;
                }
            };


            $scope.init = function () {
                $scope.id = $stateParams.id;
                $scope.output_properties = [];
                $scope.input_properties = [];
                $scope.input_files = [];
                $scope.output_files = [];


                mcapi('/processes/%', $scope.id)
                    .success(function (data) {
                        $scope.process = data;
                        $scope.input_files = $filter('processFilter')($scope.process.inputs, 'file');
                        $scope.output_files = $filter('processFilter')($scope.process.outputs, 'file');
                        $scope.input_conditions = $filter('processFilter')($scope.process.inputs, 'condition', 'id');
                        $scope.output_conditions = $filter('processFilter')($scope.process.outputs, 'condition', 'id');
                    }).jsonp();


            };
            $scope.init();
        }]);
