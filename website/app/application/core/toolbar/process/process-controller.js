Application.Controllers.controller('toolbarProcess',
    ["$scope", "mcapi", "$state", "$stateParams",
        function ($scope, mcapi, $state, $stateParams) {

            function init() {
                var process_id = $stateParams.id;
                mcapi('/processes/%', process_id)
                    .success(function (data) {
                        $scope.process = data;
                    }).jsonp();
            }

            init();
        }]);
