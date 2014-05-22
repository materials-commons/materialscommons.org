Application.Controllers.controller('toolbarTemplates',
    ["$scope", "mcapi", function ($scope, mcapi) {

        mcapi('/templates/by_pick/%', 'experiment')
            .success(function (data) {
                $scope.experimental_templates = data;

            }).jsonp();

        mcapi('/templates/by_pick/%', 'computation')
            .success(function (data) {
                $scope.computational_templates = data;
            }).jsonp();

        $scope.toggle_selection = function () {

        };

    }]);