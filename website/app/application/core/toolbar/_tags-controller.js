Application.Controllers.controller('_toolbarTags',
    ["$rootScope", "$scope", "mcapi", "pubsub",
        function ($rootScope, $scope, mcapi, pubsub) {
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
                if ($rootScope.email_address) {
                    tagsCount();
                }
            }

            init();
        }]);