function DataEditController($scope, $routeParams, $window, $http, $rootScope, User, alertService) {
    //filePath = assets/materialscommons/location/name
    $scope.setupAccessToUserFile = function() {
        //alert($scope.doc.mediaType);

        $scope.fileType = determineFileType($scope.doc.mediaType);
        $scope.fileSrc = filePath($scope.fileType, $scope.doc.mediaType, $scope.doc.location, $scope.doc.name);
    }

    $http.jsonp(mcurljsonp('/user/%/datafile/%', User.u(), $routeParams.id))
        .success(function (data) {
            $scope.doc = data;
            $scope.setupAccessToUserFile();
        });
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
    $http.jsonp(mcurljsonp('/tags'))
        .success(function (data) {
            data.forEach(function (item) {
                $scope.tagchoices.push(item.id);
                $scope.originalTags.push(item.id);
            })
        });

    $http.jsonp(mcurljsonp('/user/%/datafile/reviews/%', User.u(), $routeParams.id))
        .success(function (data) {
            $scope.scheduledReviews = _.filter(data, function(item) {
                if (! item.done) { return item; }
            });
        });

    $http.jsonp(mcurljsonp('/private/user/%/selected_users', User.u()))
        .success(function (data) {
            $scope.users = data;
            //console.log('selected users are : '+ $scope.users);
        })
        .error(function () {
            //console.log("error: in finding all users");
        });




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
            $scope.$on('handleBroadcast', function() {
                $scope.message = alertService.message;
            });

        }
    }

    $scope.saveData = function () {
        $http.put(mcurl('/user/%/datafile/update/%', User.u(), $scope.doc.id), $scope.doc)
            .success(function (data) {
                $scope.addNewTags();
                //console.log('msg received is ' + data.msg) ;
                alertService.prepForBroadcast(data.msg);
                $scope.$on('handleBroadcast', function() {
                    $scope.message = alertService.message;
                });
            }).error(function (data, status, headers, config) {
               console.log('im in error part');
            });

        $window.history.back();
    }

    $scope.addNewTags = function () {
        var newtags = _.difference($scope.tagchoices, $scope.originalTags);
        var tagObj = {};
        newtags.forEach(function (item) {
            tagObj.id = item;
            $http.post(mcurl('/tag'), tagObj)
                .success(function(data){

                })
                .error(function(){

                });
        });
    }

    $scope.addReview = function () {
        var review = {};
        review.note = $scope.review_note;
        var now = new Date();
        review.type = "data";
        review.markedOnDate = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate();
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
        $http.post(mcurl('/user/%/review', User.u()), review)
            .success(function (data) {
                alertService.prepForBroadcast(data.msg);
                $scope.$on('handleBroadcast', function() {
                    $scope.message = alertService.message;
                });
                $http.jsonp(mcurljsonp('/user/%/datafile/reviews/%', User.u(), $routeParams.id))
                    .success(function (data) {
                        $scope.scheduledReviews = _.filter(data, function(item){
                            if (!item.done) { return item; }
                        });
                        $scope.user_for_review = "";
                    });
            });
        $scope.schedule_for_self = false;
    }

    $scope.addReviewForOther = function() {
        $scope.review_note = $scope.review_note_other;
        $scope.review_note_other = "";
        $scope.addReview();
    }

    $scope.cancel = function () {
        $window.history.back();
    }

    $scope.addTagKeypressCallback = function (event) {
        console.log("addTagKeypressCallback");
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

    $scope.reviewStatusChanged = function(index) {
        console.log("reviewStatusChanged = " + $scope.scheduledReviews[index]);
        $http.put(mcurl('/user/%/review/%/mark/%', User.u(), $scope.scheduledReviews[index].id,
            $scope.scheduledReviews[index].done))
            .success(function() {
               //console.log("Marked as done");
            });
    }
}

function MyDataController($scope, $http, User, $location) {

    $scope.predicate = 'name';
    $scope.reverse = false;

    $http.jsonp(mcurljsonp('/user/%/datafiles', User.u()))
        .success(function (data, status) {
            $scope.data_by_user = data;
        });

    $scope.dgroupid = "";

    $scope.editData = function (id) {
        $location.path("/data/edit/" + id);
    }

    $scope.getDatagroup = function (datagroupId) {
        if ($scope.dgroupid != datagroupId) {
            var url = mcurljsonp('/user/%/datadirs/%', User.u(), datagroupId);
            $http.jsonp(url)
                .success(function (data, status) {
                    $scope.dgroup = data;
                    $scope.dgroupid = data.id;
                });
        }
    }
}
