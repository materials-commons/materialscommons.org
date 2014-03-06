Application.Controllers.controller('toolbarFileServicesConfig',
    ["$scope", "materials", function ($scope, materials) {
        $scope.init = function () {
            materials('/admin/config')
                .success(function (data) {
                    $scope.config = data;
                }).jsonp();
        };

        $scope.init();
    }]);