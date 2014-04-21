Application.Controllers.controller('_toolbarReviews',
    ['$scope', 'mcapi', 'pubsub', function ($scope, mcapi, pubsub) {
        $scope.reviewsCount = function () {
            mcapi('/reviews/to_conduct')
                .success(function (data) {
                    $scope.reviewsToConduct = _.filter(data, function (item) {
                        if (item.status !== "Finished") {
                            return item;
                        }
                    });
                }).jsonp();
        };

        pubsub.waitOn($scope, 'reviews.change', function () {
            $scope.reviewsCount();
        });

        function init() {
            $scope.reviewsCount();
        }

        init();
    }]);
