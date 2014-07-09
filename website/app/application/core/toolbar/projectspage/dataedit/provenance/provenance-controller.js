Application.Controllers.controller('toolbarDataEditProvenance',
    ["$scope", "mcapi", "User", "$state", "$stateParams", "$filter",
        function ($scope, mcapi, User, $state, $stateParams, $filter) {

            $scope.showProvDetails = function (item) {
                    switch (item.type) {
                        case "id":
                            mcapi('/objects/%', item.properties.id.value)
                                .success(function (data) {
                                    $scope.sample = data
                                }).jsonp();
                            break;
                        case "condition":
                            $scope.item = item;
                            break;
                        case "file":
                            $state.go('toolbar.projectspage.dataedit.provenance', ({'data_id': item.properties.id.value}));
                            break;
                    }
            }
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
    ])
;
