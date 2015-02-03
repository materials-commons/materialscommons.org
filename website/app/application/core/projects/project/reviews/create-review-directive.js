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
    var stateID = $stateParams.sid;
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

    if ('files' in $scope.model) {
        projectFiles.resetSelectedFiles($scope.model.files, $scope.project.id);
    }

    $scope.review = {'items': [], 'messages': []};

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
                toggleDragButton.reset('addToReview');
            }).error(function (reason) {
            }).post($scope.review);
    }

    $scope.cancel = function () {
        projectFiles.setActive($stateParams.id, false);
        recent.gotoLast($stateParams.id);
        recent.delete($stateParams.id, $stateParams.sid);
        projectState.delete($stateParams.id, $stateParams.sid);
        $scope.bk.createReview = false;
        toggleDragButton.reset('addToReview');

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
    $scope.addItems = function (action) {
        switch (action) {
            case "samples":
                toggleDragButton.toggle(action, 'addToReview');
                break;
            case "notes":
                toggleDragButton.toggle(action, 'addToReview');
                break;
            case "files":
                toggleDragButton.toggle(action, 'addToReview');
                break;
        }
    };

    pubsub.waitOn($scope, 'addSampleToReview', function (sample) {
        addAttachment({'id': sample.id, 'name': sample.name, 'type': 'sample'});
    });

    pubsub.waitOn($scope, 'addNoteToReview', function (note) {
        addAttachment({'id': note.id, 'name': note.title, 'type': 'note'});
    });

    pubsub.waitOn($scope, 'addProvenanceToReview', function (provenance) {
        addAttachment({'id': provenance.id, 'name': provenance.name, 'type': 'provenance'});
    });

    pubsub.waitOn($scope, 'addFileToReview', function (file) {
            addAttachment({'id': file.id, 'name': file.name, 'type': 'file', 'path': file.fullname});
    });

    function addAttachment(item) {
        var i = _.indexOf($scope.model.attachments, function (entry) {
            return item.id === entry.id;
        });
        if (i === -1) {
            $scope.model.attachments.push(item);
        }
    }
}
