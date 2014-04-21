Application.Controllers.controller('toolbar',
    ["$scope", "Nav", "msocket", function ($scope, Nav, msocket) {
        $scope.isActiveStep = function (nav) {
            return Nav.isActiveToolbar(nav);
        };

        $scope.showStep = function (step) {
            Nav.setActiveToolbar(step);
        };

        $scope.$on('socket:connect', function (ev, data) {
            $scope.service.status = "Connected";
        });

        $scope.$on('socket:disconnect', function () {
            $scope.service.status = "Not Connected";
        });

        $scope.$on('socket:error', function (ev, data) {
            $scope.service.status = "Not Connected";
        });

        function init() {
            $scope.showFileServices = false;
            $scope.service = {
                status: "Not Connected"
            };
        }

        init();
    }]);









