function DataEditController($scope, $routeParams, $window, mcapi, User, alertService) {
    $scope.count = 0;
    $scope.grid_options = [];

    $scope.setupAccessToUserFile = function () {
        $scope.fileType = determineFileType($scope.doc.mediatype);
        $scope.fileSrc = filePath($scope.fileType, $scope.doc.mediatype, $scope.doc.location, $scope.doc.name);
        $scope.originalFileSrc = originalFilePath($scope.doc.location, $scope.doc.name);
        $scope.fileName = $scope.doc.name;
    }

    mcapi('/datafile/%', $routeParams.id)
        .success(function (data) {
            $scope.doc = data;
            $scope.setupAccessToUserFile();
        })
        .error(function (data) {
            alertService.prepForBroadcast(data.error);
        }).jsonp();

    $scope.signed_in_user = User.u();
    $scope.review_note = "";
    $scope.marked_for_review = false;
    $scope.reviewId = null;
    $scope.predicate = 'name';
    $scope.reverse = false;
    $scope.schedule_for_self = false;

    $scope.tagchoices = new Array();
    $scope.originalTags = [];
    mcapi('/tags')
        .success(function (data) {
            data.forEach(function (item) {
                $scope.tagchoices.push(item.id);
                $scope.originalTags.push(item.id);
            })
        }).jsonp();

    mcapi('/datafile/reviews/%', $routeParams.id)
        .success(function (data) {
            $scope.scheduledReviews = _.filter(data, function (item) {
                if (!item.done) {
                    return item;
                }
            });
        }).jsonp();

    mcapi('/selected_users')
        .success(function (data) {
            $scope.users = data;
        }).jsonp();

    $scope.removeTag = function (index) {
        $scope.doc.tags.splice(index, 1);
    }

    $scope.addTag = function () {
        if (!$scope.doc.tags) {
            $scope.doc.tags = new Array();
        }

        if (!_.contains($scope.doc.tags, $scope.tag_to_add)) {
            $scope.doc.tags.push($scope.tag_to_add);
            $scope.msg = "Data has been tagged !"
            alertService.prepForBroadcast($scope.msg);
        }
    }

    $scope.saveData = function () {
        mcapi('/datafile/update/%', $scope.doc.id)
            .success(function (data) {
                $scope.addNewTags();
                $scope.msg = "Data has been saved"
                alertService.prepForBroadcast($scope.msg);
            }).error(function (data) {
                alertService.prepForBroadcast(data.error);
            }).put($scope.doc);

        $window.history.back();
    }

    $scope.addNewTags = function () {
        var newtags = _.difference($scope.tagchoices, $scope.originalTags);
        var tagObj = {};
        newtags.forEach(function (item) {
            tagObj.id = item;
            mcapi('/tag')
                .success(function (data) {

                })
                .error(function (data) {
                    alertService.prepForBroadcast(data.error);
                }).post(tagObj);
        });
    }

    $scope.addReview = function () {
        var review = {};
        review.note = $scope.review_note;
        review.type = "data";
        if ($scope.schedule_for_self) {
            review.owner = User.u();
        }
        else {
            review.owner = $scope.user_for_review;
        }
        review.item_name = $scope.doc.name;
        review.item_id = $scope.doc.id;
        review.who = $scope.doc.owner;
        review.done = false;
        mcapi('/review')
            .success(function () {
                $scope.msg = "Review/Followup has been added"
                alertService.prepForBroadcast($scope.msg);
                mcapi('/datafile/reviews/%', $routeParams.id)
                    .success(function (data) {
                        $scope.scheduledReviews = _.filter(data, function (item) {
                            if (!item.done) {
                                return item;
                            }
                        });
                        $scope.user_for_review = "";
                    }).jsonp();
            }).post(review);
        $scope.schedule_for_self = false;
    }

    $scope.addReviewForOther = function () {
        $scope.review_note = $scope.review_note_other;
        $scope.review_note_other = "";
        $scope.addReview();
    }

    $scope.cancel = function () {
        $window.history.back();
    }

    $scope.addTagKeypressCallback = function (event) {
        if (!_.contains($scope.tagchoices, $scope.new_tag)) {
            $scope.tagchoices.push($scope.new_tag);
        }

        $scope.tag_to_add = $scope.new_tag;
        $scope.addTag();
        $scope.new_tag = "";
    }

    $scope.addNoteKeypressCallback = function (event) {
        $scope.doc.notes.push($scope.new_note);
        $scope.new_note = "";
    }
    $scope.add_notes = function () {
        $scope.doc.notes.push($scope.new_note);
        $scope.new_note = "";
    }


    $scope.addReviewNoteKeypressCallback = function (event) {
        $scope.schedule_for_self = true;
        $scope.review_note = $scope.review_note_self;
        $scope.review_note_self = "";
        $scope.addReview();
    }

    $scope.reviewStatusChanged = function (index) {
        mcapi('/review/%/mark/%', $scope.scheduledReviews[index].id,
            $scope.scheduledReviews[index].done)
            .success(function () {
                $scope.msg = "Review Status has been changed"
                alertService.prepForBroadcast($scope.msg);
            }).put();
    }
}

function MyDataController($scope, mcapi, $location) {
    $scope.predicate = 'name';
    $scope.reverse = false;
    mcapi('/datafiles')
        .success(function (data) {
            $scope.data_by_user = data;
        }).jsonp();

    $scope.dgroupid = "";

    $scope.editData = function (id) {
        $location.path("/data/edit/" + id);
    }

    $scope.getDatagroup = function (datagroupId) {
        if ($scope.dgroupid != datagroupId) {
            mcapi('/datadirs/%', datagroupId)
                .success(function (data) {
                    $scope.dgroup = data;
                    $scope.dgroupid = data.id;
                }).jsonp();
        }
    }
}