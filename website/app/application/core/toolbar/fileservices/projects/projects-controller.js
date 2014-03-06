Application.Controllers.controller('toolbarFileServicesProjects',
    ["$scope", "materials", function ($scope, materials) {
        $scope.init = function () {
            materials('/projects')
                .success(function (data) {
                    $scope.projects = data;
                }).jsonp();
        };

        $scope.init();
    }]);