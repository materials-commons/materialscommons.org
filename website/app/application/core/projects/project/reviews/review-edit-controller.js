Application.Controllers.controller('projectEditReview',
    ["$scope", "project", "$stateParams", "Review", "User", "$filter", "$modal",projectEditReview]);

function projectEditReview($scope, project, $stateParams, Review, User, $filter, $modal) {

    $scope.openReview = function (review) {
        $scope.review = review;
    };
    $scope.addComment = function () {
        Review.addComment($scope.model, $scope.review);
        $scope.model.comment = '';
    };
    $scope.archiveReview = function () {
        Review.closeReview($scope.review.id, project);
    };

    $scope.openDetails = function (params) {
        $scope.modal = {
            instance: null,
            items: [params]
        };
        var template = '';
        switch (params.type){
            case "datafile":
                 template = 'application/core/projects/project/home/directives/display-file.html';
                break;
            case "sample":
                 template = 'application/core/projects/project/home/directives/display-sample.html';
                break;
            case "process":
                template = 'application/core/projects/project/home/directives/display-process.html';
                break;
        }
        $scope.modal.instance = $modal.open({
            size: 'lg',
            templateUrl: template,
            controller: 'ModalInstanceCtrl',
            resolve: {
                modal: function () {
                    return $scope.modal;
                },
                project: function () {
                    return $scope.project;
                }
            }
        });
    };
    $scope.project = project;
    $scope.user = User.u();
    $scope.today = new Date();
    $scope.model = {
        title: "",
        comment: ''
    };
    function init() {
        if ($stateParams.review_id) {
            if ($stateParams.category === 'due') {
                $scope.reviews =   $filter('byKey')($scope.project.reviews, 'assigned_to', User.u());
            } else if ($stateParams.category === 'closed') {
                $scope.reviews =  $filter('byKey')($scope.project.reviews, 'status', 'closed');
            } else {
                $scope.reviews =  $filter('byKey')($scope.project.reviews, 'status', 'open');
            }

            var i = _.indexOf($scope.reviews, function (rev) {
                return $stateParams.review_id === rev.id;
            });
            if (i !== -1) {
                $scope.review = $scope.reviews[i];
                Review.setActiveReview($scope.review);
            }
        }
    }

    init();
}
