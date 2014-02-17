Application.Controllers.controller('toolbarReviews',
    ["$scope", "mcapi", "$state", "pubsub",

        function ($scope, mcapi, $state, pubsub) {
            pubsub.waitOn($scope, 'reviews.change', function () {
                $scope.reviewsCount();
            });

            mcapi('/reviews/requested')
                .success(function (data) {
                    $scope.reviewsRequested = _.filter(data, function (item) {
                        if (item.status != "Finished") {
                            return item;
                        }
                    });
                }).jsonp();

            $scope.reviewsCount = function () {
                mcapi('/reviews/to_conduct')
                    .success(function (data) {
                        $scope.reviewstoConduct = _.filter(data, function (item) {
                            if (item.status != "Finished") {
                                return item;
                            }
                        });
                    }).jsonp();
            }

            $scope.reviewsCount();

            $scope.startReview = function (id, type) {
                if (type == "data") {
                    $state.go('toolbar.dataedit', {id: id});
                }
            }

            $scope.removeReview = function (index) {
                var id = $scope.reviews[index].id;
                mcapi('/review/%', id)
                    .success(function (data) {
                        $scope.reviews.splice(index, 1);
                    }).delete();
            }

            $scope.removeReview_to_conduct = function (index) {
                var id = $scope.reviewstoConduct[index].id;
                mcapi('/review/%/requested', id)
                    .success(function () {
                        $scope.reviewstoConduct.splice(index, 1);
                    }).delete()
            }
            $scope.removeReview_requested = function (index) {
                var id = $scope.reviewsRequested[index].id;
                mcapi('/review/%/requested', id)
                    .success(function () {
                        $scope.reviewsRequested.splice(index, 1);
                    }).delete()
            }
        }]);
