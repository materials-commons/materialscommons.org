Application.Controllers.controller('toolbarTags',
    ["$scope", "mcapi", "pubsub", function ($scope, mcapi, pubsub) {
        $scope.tagHeader = "All Tags";

        pubsub.waitOn($scope, 'tags.change', function () {
            $scope.tagsCount();
        });

        $scope.tagsCount = function () {
            mcapi('/tags/count')
                .success(function (data) {
                    $scope.tags = data.sort(function (a, b) {
                        return a.count - b.count;
                    });
                    $scope.tags  = $scope.tags.reverse();
                }).jsonp();
        };

        $scope.tagsCount();

    }]);