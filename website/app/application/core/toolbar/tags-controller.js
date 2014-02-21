Application.Controllers.controller('_toolbarTags',
    ["$scope", "mcapi", "pubsub", function ($scope, mcapi, pubsub) {
        pubsub.waitOn($scope, 'tags.change', function () {
            $scope.tagsCount();
        });

        $scope.init = function () {
            mcapi('/tags/count')
                .success(function (data) {
                    $scope.tags = data;
                }).jsonp();
        };

        $scope.init();
    }]);