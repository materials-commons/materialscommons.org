Application.Controllers.controller('toolbarTags',
    ["$scope", "mcapi", "pubsub", "Nav", function ($scope, mcapi, pubsub, Nav) {
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
                    $scope.tags = $scope.tags.reverse();
                }).jsonp();
        };

        $scope.tagsCount();
        function init() {
            Nav.setActiveNav('Tags');

        }
        init();

    }]);