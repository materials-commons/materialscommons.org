Application.Controllers.controller('toolbar',
    ["$scope", "Nav", "msocket", "$rootScope", "$state", function ($scope, Nav, msocket, $rootScope, $state) {
        $scope.isActiveStep = function (nav) {
            return Nav.isActiveNav(nav);
        };

        $scope.showStep = function (step) {
            Nav.setActiveNav(step);
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

        $scope.activateButton = function (btn) {
            switch (btn) {
                case "projects":
                    $scope.disable1 = false;
                    $scope.disable2 = true;
                    $scope.disable3 = true;
                    $scope.disable4 = true;
                    $scope.activebtn = 'projects';
                    $state.go('toolbar.projectspage');
                    break;
                case "samples":
                    $scope.disable1 = true;
                    $scope.disable2 = false;
                    $scope.disable3 = true;
                    $scope.disable4 = true;
                    $scope.activebtn = 'samples'
                    $state.go('toolbar.objects');
                    break;
                case "provenance":
                    $scope.disable1 = true;
                    $scope.disable2 = true;
                    $scope.disable3 = false;
                    $scope.disable4 = true;
                    $scope.activebtn = 'provenance'
                    $state.go('toolbar.provenance');
                    break;
                case "machines":
                    $scope.disable1 = true;
                    $scope.disable2 = true;
                    $scope.disable3 = true;
                    $scope.disable4 = false;
                    $scope.activebtn = 'machines'
                    $state.go('toolbar.machines');
                    break;
            }
        }

        $scope.callMouseLeave = function (btn) {
            if (!($scope.activebtn)) {
                return true;
            }
        }
        $scope.callMouseOver = function (btn) {
            if (btn === 'projects') {
                $scope.disable1 = false;
                $scope.disable2 = true;
                $scope.disable3 = true;
                $scope.disable4 = true;
            } else if (btn === 'samples') {
                $scope.disable1 = true;
                $scope.disable2 = false;
                $scope.disable3 = true;
                $scope.disable4 = true;
            }
            else if (btn === 'provenance') {
                $scope.disable1 = true;
                $scope.disable2 = true;
                $scope.disable3 = false;
                $scope.disable4 = true;
            }
            else if (btn === 'machines') {
                $scope.disable1 = true;
                $scope.disable2 = true;
                $scope.disable3 = true;
                $scope.disable4 = false;
            }

        }

        function init() {
            $scope.disable1 = true;
            $scope.disable2 = true;
            $scope.disable3 = true;
            $scope.disable4 = true;
            $scope.activebtn = '';

            $scope.showFileServices = false;
            $scope.service = {
                status: "Not Connected"
            };
        }

        init();
    }]);









