Application.Directives.directive('createReview', createReviewDirective);
function createReviewDirective() {
    return {
        restrict: "EA",
        controller: 'createReviewDirectiveController',
        scope: {
            bk: '=bk'
        },
        templateUrl: 'application/core/projects/project/reviews/create.html'
    };
}


Application.Controllers.controller('createReviewDirectiveController',
    ["$scope", "mcapi", "User", "$stateParams",
         "pubsub", "projectFiles",
        "projectState", "recent", "ui", "current", createReviewDirectiveController]);

function createReviewDirectiveController($scope, mcapi, User, $stateParams, pubsub,
                              projectFiles, projectState, recent, ui, current) {
    $scope.project = current.project();
    var channel = 'review.files';
    var stateID = $stateParams.sid;
    projectFiles.setChannel(channel);
    projectFiles.setActive($stateParams.id, true);
    ui.setShowFiles($stateParams.id, true);

    var defaultModel = {
        comment: "",
        assigned_to: "",
        title: "",
        files: []
    };

    $scope.model = projectState.getset($stateParams.id, $stateParams.sid, defaultModel);
    recent.addIfNotExists($scope.project.id, $stateParams.sid, "New Review");

   if('files' in $scope.model){
       projectFiles.resetSelectedFiles($scope.model.files, $scope.project.id);
   }

    $scope.review = {'items': [], 'messages': []};

    pubsub.waitOn($scope, channel, function (fileentry) {
        if (fileentry.selected) {
            $scope.model.files.push(fileentry);
        } else {
            var i = _.indexOf($scope.model.files, function (entry) {
                return entry.id === fileentry.id;
            });
            if (i !== -1) {
                $scope.model.files.splice(i, 1);
            }
        }
    });

    function saveData() {
        mcapi('/reviews')
            .success(function (review) {
                $scope.project.reviews.unshift(review);
                projectFiles.setActive($scope.project.id, false);
                recent.delete($scope.project.id, stateID);
                projectState.delete($scope.project.id, stateID);
                pubsub.send("reviews.change");
                $scope.bk.createReview = false;
            }).error(function (reason) {
            }).post($scope.review);
    }

    $scope.cancel = function () {
        projectFiles.setActive($stateParams.id, false);
        recent.gotoLast($stateParams.id);
        recent.delete($stateParams.id, $stateParams.sid);
        projectState.delete($stateParams.id, $stateParams.sid);
        $scope.bk.createReview = false;
    };

    $scope.create = function () {
        $scope.model.files.forEach(function (f) {
            $scope.review.items.push({
                'id': f.id,
                'path': f.fullname,
                'name': f.name,
                'type': f.type
            });
        });
        $scope.review.author = User.u();
        $scope.review.assigned_to = $scope.model.assigned_to;
        $scope.review.status = 'open';
        $scope.review.title = $scope.model.title;
        var newdate = new Date();
        $scope.review.messages.push({
            'message': $scope.model.comment,
            'who': User.u(),
            'date': newdate.toDateString()
        });
        $scope.review.project = $scope.project.id;
        saveData();
    };

    $scope.removeFile = function (index) {
        $scope.model.files[index].selected = false;
        $scope.model.files.splice(index, 1);
    };
}
