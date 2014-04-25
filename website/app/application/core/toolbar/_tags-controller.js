Application.Controllers.controller('_toolbarTags',
    ["$scope", "mcapi", "pubsub", "User",
        function ($scope, mcapi, pubsub, User) {
            function tagsCount() {
                mcapi('/tags/count')
                    .success(function (data) {
                        $scope.tags = data.sort(function (a, b) {
                            return a.count - b.count;
                        });
                        $scope.tags = $scope.tags.reverse();
                    }).jsonp();
            }

            pubsub.waitOn($scope, 'tags.change', function () {
                tagsCount();
            });

            function init() {
                if (User.isAuthenticated()) {
                    tagsCount();
                }
            }

            init();
        }]);