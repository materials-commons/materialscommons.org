function CreateReviewController($scope, mcapi, User, $routeParams, alertService, $window){
    $scope.all_reviews = [];


    $scope.signed_in_user = User.u();
    $scope.review_note = "";
    $scope.schedule_for_self = false;

    mcapi('/datafile/%/reviews', $routeParams.id)
        .success(function(data){
            data.forEach(function(item){
                $scope.all_reviews.push(item.right)
            })
        }).jsonp();

    mcapi('/selected_users')
        .success(function (data) {
            $scope.users = data;
        }).jsonp();


    $scope.addReview = function () {
        var review = {};
        review.note = $scope.review_note;
        review.item_type = "data";
        review.status = "InProcess" ;
        review.requested_by = User.u();
        if ($scope.schedule_for_self) {
            review.requested_to = User.u();
        }
        else {
            review.requested_to = $scope.user_for_review;
        }
        review.item_name = $scope.doc.name;
        review.item_id = $scope.doc.id;
        mcapi('/review')
            .success(function (data) {
                $scope.all_reviews = [];
                $scope.data_file_id  = data;
                $scope.msg = "Review/Followup has been added"
                alertService.sendMessage($scope.msg);
                mcapi('/datafile/%/reviews', $scope.data_file_id)
                    .success(function(data){
                        data.forEach(function(item){
                            $scope.all_reviews.push(item.right)
                        })
                    }).jsonp();
            }).post(review);
        $scope.schedule_for_self = false;
    }

    $scope.addReviewForOther = function () {
        $scope.review_note = $scope.review_note_other;
        $scope.review_note_other = "";
        $scope.addReview();
    }

    $scope.addReviewNoteKeypressCallback = function (event) {
        $scope.schedule_for_self = true;
        $scope.review_note = $scope.review_note_self;
        $scope.review_note_self = "";
        $scope.addReview();
    }

    $scope.reviewStatusChanged = function (index) {
        mcapi('/review/%/mark/%', $scope.all_reviews[index].id, $scope.all_reviews[index].status)
            .success(function () {
                $scope.msg = "Review Status has been changed"
                alertService.sendMessage($scope.msg);
            }).put();
    }

}

function ReviewListController($scope, $location, mcapi) {
    mcapi('/reviews/requested')
        .success(function (data) {
            $scope.reviewsRequested = _.filter(data, function (item) {
                if (item.status != "Finished") {
                    return item;
                }
            });
        }).jsonp();

    mcapi('/reviews/to_conduct')
        .success(function (data) {
            $scope.reviewstoConduct = _.filter(data, function (item) {
                if (item.status != "Finished") {
                    return item;
                }
            });
        }).jsonp();

    $scope.startReview = function (id, type) {
        if (type == "data") {
            $location.path("/data/edit/" + id);
        }
        else {
        }
    }

    $scope.removeReview = function (index) {
        var id = $scope.reviews[index].id;
        mcapi('/review/%', id)
            .success(function (data) {
                $scope.reviews.splice(index, 1);
            }).delete();
    }

    $scope.removeRequestedReview = function (index) {
        var id = $scope.reviewsRequested[index].id;
        mcapi('/review/%/requested', id)
            .success(function () {
                $scope.reviewsRequested.splice(index, 1);
            }).delete()
    }
}
