Application.Controllers.controller('toolbar',
    ["$scope", "Nav", "msocket", function ($scope, Nav, msocket) {
        $scope.isActiveStep = function (nav) {
            return Nav.isActiveToolbar(nav);
        };

        $scope.showStep = function (step) {
            Nav.setActiveToolbar(step);
        };

        $scope.$on('socket:file', function (ev, data) {
            console.dir(ev);
            console.dir(data);
        });

        $scope.init = function () {
            $scope.showDrafts = true;
        };

        $scope.init();
    }]);









