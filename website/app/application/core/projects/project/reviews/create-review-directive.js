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
        "projectState", "recent", "ui", "current", "toggleDragButton", createReviewDirectiveController]);

function createReviewDirectiveController($scope, mcapi, User, $stateParams, pubsub,
                              projectFiles, projectState, recent, ui, current, toggleDragButton) {
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
        files: [],
        attachments: [],
        itemType: ''
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
                $scope.model = {};
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
        $scope.review.author = User.u();
        $scope.review.assigned_to = $scope.model.assigned_to;
        $scope.review.status = 'open';
        $scope.review.title = $scope.model.title;
        $scope.review.attachments = $scope.model.attachments;
        var newdate = new Date();
        $scope.review.messages.push({
            'message': $scope.model.comment,
            'who': User.u(),
            'date': newdate.toDateString()
        });
        $scope.review.project = $scope.project.id;
        saveData();
    };

    $scope.removeAttachment = function (index) {
        $scope.model.attachments.splice(index, 1);
    };
    $scope.addItems = function(){
        switch($scope.bk.itemType){
            case "samples":
                toggleDragButton.toggle($scope.bk.itemType,'addToReview');
                break;
            case "notes":
                toggleDragButton.toggle($scope.bk.itemType,'addToReview');
                break;
            case "files":
                toggleDragButton.toggle($scope.bk.itemType,'addToReview');
                break;
        }
    };

    pubsub.waitOn($scope, 'addSampleToReview', function(sample){
        $scope.model.attachments.push({'id': sample.id, 'name': sample.name, 'type': 'sample'});
    });
    pubsub.waitOn($scope, 'addNoteToReview', function(note){
        $scope.model.attachments.push({'id': note.id, 'name': note.title, 'type': 'note'});
    });
    pubsub.waitOn($scope, 'addProvenanceToReview', function(provenance){
        $scope.model.attachments.push({'id': provenance.id, 'name': provenance.name, 'type': 'provenance'});
    });
    pubsub.waitOn($scope, 'addFileToReview', function(file){
        $scope.model.attachments.push({'id': file.id, 'name': file.name, 'type': 'file', 'path': file.fullname});
    });
}
