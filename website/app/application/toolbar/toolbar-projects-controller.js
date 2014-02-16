Application.Controllers.controller('toolbarProjects', ["$scope", "mcapi",
    function ($scope, mcapi) {
        $scope.init = function () {
            mcapi('/projects/by_group')
                .success(function (data) {
                    $scope.projects = data;
                })
                .error(function (data) {

                }).jsonp();
        };

        $scope.init();
    }]);