Application.Controllers.controller('toolbarTags',
    ["$scope", "mcapi", "pubsub", function ($scope, mcapi, pubsub) {
        $scope.tagHeader = "All Tags";

        pubsub.waitOn($scope, 'tags.change', function () {
            $scope.tagsCount();
        });

        $scope.tagsCount = function () {
            mcapi('/tags/count')
                .success(function (data) {
                    $scope.tags = data;
                }).jsonp();
        };

        $scope.tagsCount();

    }]);