Application.Controllers.controller('toolbarDataEditProvenance',
    ["$scope", "mcapi", "User", "$state", "$stateParams", "$filter",
        function ($scope, mcapi, User, $state, $stateParams, $filter) {

            $scope.showProvDetails = function (item, category) {
                if (category == 'input') {
                    switch (item.type) {
                        case "id":
                            mcapi('/objects/%', item.id)
                                .success(function (data) {
                                    $scope.sample = data
                                }).jsonp();
                            break;
                        case "condition":
                            $scope.process.inputs.forEach(function (each_ip) {
                                if (each_ip.template == item.name) {
                                    $scope.settings = each_ip;
                                }
                            })
                            break;
                        case "file":
                            $state.go('toolbar.projectspage.dataedit.provenance', ({'data_id': item.id}));
                            break;
                    }
                }
                else {
                    switch (item.type) {

                        case "id":
                            mcapi('/objects/%', item.id)
                                .success(function (data) {
                                    $scope.sample = data
                                }).jsonp();
                            break;
                        case "condition":
                            //$scope.settings = $scope.process.inputs.
                            break;
                        case "file":
                            $state.go('toolbar.projectspage.dataedit.provenance', ({'data_id': item.id}));
                            break;
                    }
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
                        console.log($scope.df_denorm[0].right)
//                        $scope.input_processes = $filter('inputOutput')($scope.df_denorm, 'input')
//                        $scope.output_processes = $filter('inputOutput')($scope.df_denorm, 'output')
                    }).jsonp();
            };
            $scope.init();
        }
    ])
;
