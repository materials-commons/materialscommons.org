Application.Controllers.controller('toolbarReviews',
    ['$scope', 'mcapi', 'pubsub', function ($scope, mcapi, pubsub) {
        pubsub.waitOn($scope, 'reviews.change', function () {
            $scope.reviewsCount();
        });

        $scope.init = function () {
            mcapi('/reviews/to_conduct')
                .success(function (data) {
                    $scope.reviewstoConduct = _.filter(data, function (item) {
                        if (item.status != "Finished") {
                            return item;
                        }
                    });
                }).jsonp();
        };

        $scope.init();
    }]);
