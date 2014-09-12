Application.Directives.directive('actionCreateReview', actionCreateReviewDirective);

function actionCreateReviewDirective() {
    return {
        scope: {},
        controller: "actionCreateReviewController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-create-review.html"
    };
}

Application.Controllers.controller('actionCreateReviewController',
    ["$scope", "$state", "mcapi", "dateGenerate", "User", "pubsub", "$stateParams", "model.projects", "projectFiles", "toastr", actionCreateReviewController]);

function actionCreateReviewController($scope, $state, mcapi, dateGenerate, User, pubsub, $stateParams, Projects, projectFiles, toastr) {


    $scope.addReview = function () {

        $scope.model.files.forEach(function (f) {
            $scope.review.items.push({
                'id': f.id,
                'path': f.fullname,
                'name': f.name,
                'type': f.type});
        });
        $scope.review.author = User.u();
        $scope.review.assigned_to = $scope.model.assigned_to;
        $scope.review.status = 'open';
        $scope.review.title = $scope.model.title;
        $scope.review.messages.push({'message': $scope.model.comment, 'who': User.u(), 'date': dateGenerate.new_date()});
        $scope.review.project = $scope.project_id;
        $scope.saveData();
    };
    $scope.saveData = function () {
        mcapi('/reviews')
            .success(function (data) {
                $scope.reset();
                Projects.getList(true).then(function (data) {
                    $scope.projects = data;
                    Projects.get($stateParams.id).then(function (project) {
                        $scope.project = project;
                        pubsub.send('update_reviews.change');
                    });

                });

            }).error(function (reason) {

            })
            .post($scope.review);
    };

    $scope.removeFile = function (index) {
        $scope.model.files[index].selected = false;
        $scope.model.files.splice(index, 1);
    };

    $scope.indexOfFile = function (id) {
        for (var i = 0; i < $scope.model.files.length; i++) {
            if ($scope.model.files[i].id == id) {
                return i;
            }
        }
        return -1;
    };
    $scope.reset = function () {
        $scope.model = {
            comment: "",
            assigned_to: "",
            title: "",
            files: []
        };
        $scope.review = {'items': [], 'messages': []};

    };

    function init() {
        $scope.channel = 'action-reviews';
        projectFiles.setChannel($scope.channel);
        Projects.getList().then(function (data) {
            $scope.projects = data;
        });
        $scope.project_id = $stateParams.id;
        Projects.get($stateParams.id).then(function (project) {
            $scope.project = project;
        });
        $scope.reset();
    }

    init();

    pubsub.waitOn($scope, $scope.channel, function (fileentry) {
        if (fileentry.selected) {
            $scope.model.files.push(fileentry);
        } else {
            var i = $scope.indexOfFile(fileentry.id);
            if (i != -1) {
                $scope.model.files.splice(i, 1);
            }
        }
    });
}
