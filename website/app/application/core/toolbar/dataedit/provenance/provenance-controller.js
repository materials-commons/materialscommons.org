Application.Controllers.controller('toolbarDataEditProvenance',
    ["$scope", "mcapi", "User", "$state", "$stateParams", "alertService", "watcher",
        function ($scope, mcapi, User, $state, $stateParams, alertService, watcher) {

            watcher.watch($scope, 'model.selected_input_process', function () {
                $scope.show_process(JSON.parse($scope.model.selected_input_process));
            });

            $scope.show_process = function (p) {
                $scope.process = p;
                $scope.show_pr = true;
                $scope.input_files = $scope.process.input_files;
                $scope.output_files = $scope.process.output_files;
                if (p.input_conditions.length !== 0) {
                    mcapi('/processes/extract/%/%', p.id, "input_conditions")
                        .success(function (data) {
                            $scope.ip_conditions = data;
                        })
                        .error(function (e) {

                        }).jsonp();
                }
                if (p.output_conditions.length !== 0) {
                    mcapi('/processes/extract/%/%', p.id, "output_conditions")
                        .success(function (data) {
                            $scope.op_conditions = data;
                        })
                        .error(function (e) {

                        }).jsonp();
                }
            };

            $scope.get_mode_condition = function (cond) {
                $scope.display_condition = cond;
            };

            $scope.showProcessDetails = function (process_id) {
                $state.go('toolbar.process', {id: process_id});
            };

            $scope.init = function () {
                $scope.id = $stateParams.id;
                $scope.model = {
                    selected_input_process: ''
                };
                $scope.ip_conditions = [];
                $scope.op_conditions = [];
                $scope.output_process = [];
                $scope.input_process = [];
                mcapi('/processes/output/datafile/%', $scope.id)
                    .success(function (data) {
                        $scope.output_process = data;
                        if ($scope.output_process.length !== 0) {
                            $scope.show_pr = true;
                            $scope.show_process($scope.output_process[0]);
                        }
                    }).jsonp();

                mcapi('/processes/input/datafile/%', $scope.id)
                    .success(function (data) {
                        $scope.input_processes = data;
                    }).jsonp();
            };
            $scope.init();
        }]);