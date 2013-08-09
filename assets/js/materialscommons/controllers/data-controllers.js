function DataEditController($scope, $routeParams, $window, $http, User) {
    $http.jsonp(mcurljsonpu2('/data', $routeParams.id, User))
        .success(function (data) {
            $scope.doc = data;
        });

    $scope.review_note = "";
    $scope.marked_for_review = false;
    $scope.reviewId = null;
    $scope.predicate = 'name';
    $scope.reverse = false;

    $scope.tagchoices = new Array();
    $scope.originalTags = [];
    $http.jsonp(mcurljsonp('/tags'))
        .success(function (data) {
            data.forEach(function (item) {
                $scope.tagchoices.push(item.id);
                $scope.originalTags.push(item.id);
            })
        });

    $http.jsonp(mcurljsonpu2('/data/review', $routeParams.id, User))
        .success(function (data) {
            console.dir(data);
            if (data.found) {
                $scope.review_note = data.note;
                $scope.marked_for_review = true;
                $scope.reviewId = data.id;
            }
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
        }
    }

    $scope.saveData = function () {
        console.log("Sending a put request");
        $http.put(mcurlu2('/data/update', $scope.doc.id, User), $scope.doc)
            .success(function (data, status) {
                console.log("Save: Success!!!")
                $scope.addNewTags();
                $scope.addReview();
            }).error(function (data, status, headers, config) {
                console.log("Save: Error!!!")
                // Do something here.
            });

        $window.history.back();
    }

    $scope.addNewTags = function () {
        var newtags = _.difference($scope.tagchoices, $scope.originalTags);
        var tagObj = {};
        newtags.forEach(function (item) {
            tagObj.id = item;
            $http.post(mcservicepath2('/tag'), tagObj);
        });
    }

    $scope.addReview = function () {
        console.log("marked_for_review = " + $scope.marked_for_review);
        if ($scope.marked_for_review) {
            var review = {};
            review.note = $scope.review_note;
            var now = new Date();
            review.type = "data";
            review.markedOnDate = now.getFullYear() + '/' + (now.getMonth()+1) + '/' + now.getDate();
            review.owner = User.get_username();
            review.itemName = $scope.doc.name;
            review.itemId = $scope.doc.id;
            review.who = $scope.doc.owner;
            $http.post(mcserviceupath2(User, '/review'), review)
                .success(function (data) {
                    console.log("added review");
                    console.dir(data);
                });
        }
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
}

function MyDataController($scope, $http, User, $location) {

    $scope.predicate = 'name';
    $scope.reverse = false;

    $http.jsonp(mcurljsonpu('/data', User))
        .success(function (data, status) {
            $scope.data_by_user = data;
        });

    $scope.dgroupid = "";

    $scope.editData = function (id) {
        $location.path("/data/edit/" + id);
    }

    $scope.getDatagroup = function (datagroupId) {
        if ($scope.dgroupid != datagroupId) {
            var url = mcurljsonpu2('/datagroup', datagroupId, User);
            $http.jsonp(url)
                .success(function (data, status) {
                    $scope.dgroup = data;
                    $scope.dgroupid = data.id;
                });
        }
    }
}
