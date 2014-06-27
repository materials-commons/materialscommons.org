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
                    })
                    .error(function (data) {
                        alertService.sendMessage(data.error);
                    }).jsonp();
                $scope.ip_conditions = [];
                $scope.op_conditions = [];
                $scope.output_process = [];
                $scope.input_process = [];
//                mcapi('/processes/output/datafile/%', $scope.id)
//                    .success(function (data) {
//                        $scope.output_process = data;
//                    }).jsonp();
//
//                mcapi('/processes/input/datafile/%', $scope.id)
//                    .success(function (data) {
//                        $scope.input_processes = data;
//                    }).jsonp();
                mcapi('/processes/%', 'd16516d8-f697-4072-8e85-8564d6460f29')
                    .success(function (data) {
                        $scope.process = data;
                        $scope.inputs = $filter('slice')($scope.process.inputs)
                        $scope.outputs = $filter('slice')($scope.process.outputs)
                    }).jsonp();
//                mcapi('/processes/file/%', $stateParams.id)
//                    .success(function (data2) {
//                    }).jsonp();
            };
            $scope.init();
        }
    ])
;
