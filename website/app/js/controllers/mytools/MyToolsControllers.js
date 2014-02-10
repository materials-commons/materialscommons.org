function MyToolsController($scope) {
    $scope.show_drafts = false;
}

function MyToolsProjectsController($scope, mcapi, pubsub, User) {
    mcapi('/projects/by_group')
        .success(function (data) {
            $scope.projects = data;
        })
        .error(function (data) {

        }).jsonp();
}

function MyToolsDraftsController($scope, Stater, pubsub, User) {
    pubsub.waitOn($scope, 'drafts.change', function () {
        $scope.drafts = Stater.all;
    });

    pubsub.waitOn($scope, 'drafts.update', function () {
        Stater.retrieveAll(User.u(), function () {
            pubsub.send('drafts.change', '');
        })
    })

    $scope.drafts = Stater.all;

    $scope.retrieveDrafts = function () {
        Stater.retrieveAll(User.u(), function () {
            $scope.drafts = Stater.all;
        });
    }

    $scope.retrieveDrafts();
}

function MyToolsReviewsController($scope, mcapi, pubsub) {
    pubsub.waitOn($scope, 'reviews.change', function () {
        $scope.reviewsCount();
    });

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
}

function MyToolsTagsController($scope, mcapi, pubsub) {
    pubsub.waitOn($scope, 'tags.change', function () {
        $scope.tagsCount();
    });

    $scope.tagsCount = function () {
        mcapi('/tags/count')
            .success(function (data) {
                $scope.tags = data;
            }).jsonp();
    }

    $scope.tagsCount();
}