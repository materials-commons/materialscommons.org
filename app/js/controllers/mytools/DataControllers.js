function DataEditController($scope, $routeParams, $window, mcapi, User, alertService, decodeAlerts) {

    $scope.setupAccessToUserFile = function () {
        $scope.fileType = determineFileType($scope.doc.mediaType);
        $scope.fileSrc = filePath($scope.fileType, $scope.doc.mediaType, $scope.doc.location, $scope.doc.name);
        $scope.originalFileSrc = originalFilePath($scope.doc.location, $scope.doc.name);
        $scope.fileName = $scope.doc.name;
    }

    mcapi('/user/%/datafile/%', User.u(), $routeParams.id)
        .success(function (data) {
            $scope.doc = data;
            $scope.setupAccessToUserFile();
        })
        .error(function (data) {

        }).jsonp();

    //This obj is used in data-edit
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
        }).error(function (data, status) {

        }).jsonp();

    mcapi('/user/%/datafile/reviews/%', User.u(), $routeParams.id)
        .success(function (data) {
            $scope.scheduledReviews = _.filter(data, function (item) {
                if (!item.done) {
                    return item;
                }
            });
        }).jsonp();

    mcapi('/private/user/%/selected_users', User.u())
        .success(function (data) {
            $scope.users = data;
        })
        .error(function () {
            //console.log("error: in finding all users");
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
        mcapi('/user/%/datafile/update/%', User.u(), $scope.doc.id)
            .success(function (data) {
                $scope.msg = "Data has been saved"
                console.log($scope.msg);
                $scope.addNewTags();
                alertService.prepForBroadcast($scope.msg);
            }).error(function (data) {
                $scope.msg = decodeAlerts.get_alert_msg(data.error);
                alertService.prepForBroadcast($scope.msg);
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
                .error(function () {

                }).post(tagObj);
        });
    }

    $scope.addReview = function () {
        var review = {};
        review.note = $scope.review_note;
        var now = new Date();
        review.type = "data";
        if ($scope.schedule_for_self) {
            review.owner = User.u();
        }
        else {
            review.owner = $scope.user_for_review;
        }
        review.itemName = $scope.doc.name;
        review.itemId = $scope.doc.id;
        review.who = $scope.doc.owner;
        review.done = false;
        mcapi('/user/%/review', User.u())
            .success(function (data) {
                $scope.msg= "Review/Fowllowup has been added"
                alertService.prepForBroadcast($scope.msg);
                mcapi('/user/%/datafile/reviews/%', User.u(), $routeParams.id)
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
    }

    $scope.addReviewNoteKeypressCallback = function (event) {
        $scope.schedule_for_self = true;
        $scope.review_note = $scope.review_note_self;
        $scope.review_note_self = "";
        $scope.addReview();
    }

    $scope.reviewStatusChanged = function (index) {
        console.log("reviewStatusChanged = " + $scope.scheduledReviews[index]);
        mcapi('/user/%/review/%/mark/%', User.u(), $scope.scheduledReviews[index].id,
            $scope.scheduledReviews[index].done)
            .success(function () {
                //console.log("Marked as done");
            }).put();
    }
}

function MyDataController($scope, mcapi, User, $location) {
    $scope.predicate = 'name';
    $scope.reverse = false;
    mcapi('/user/%/datafiles', User.u())
        .success(function (data, status) {
            $scope.data_by_user = data;
        })
        .error(function (data, status) {
            console.log('status for data error ' + status + ' data will be ' + data.error)

        }).jsonp();

    $scope.dgroupid = "";

    $scope.editData = function (id) {
        $location.path("/data/edit/" + id);
    }

    $scope.getDatagroup = function (datagroupId) {
        if ($scope.dgroupid != datagroupId) {
            mcapi('/user/%/datadirs/%', User.u(), datagroupId)
                .success(function (data, status) {
                    $scope.dgroup = data;
                    $scope.dgroupid = data.id;
                }).jsonp();
        }
    }
}


