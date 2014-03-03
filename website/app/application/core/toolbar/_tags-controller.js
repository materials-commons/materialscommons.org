Application.Controllers.controller('_toolbarTags',
    ["$scope", "mcapi", "pubsub", function ($scope, mcapi, pubsub) {
        $scope.tagsCount = function () {
            mcapi('/tags/count')
                .success(function (data) {
                    $scope.tags = data;
                }).jsonp();
        };

        pubsub.waitOn($scope, 'tags.change', function () {
            $scope.tagsCount();
        });

        $scope.init = function () {
            $scope.tagsCount();
        };

        $scope.init();
    }]);