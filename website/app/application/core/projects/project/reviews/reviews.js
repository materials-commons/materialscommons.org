Application.Controllers.controller('projectReviews',
                                   ["$scope", "mcapi", "$filter", "dateGenerate", "User",
                                    "model.projects", "project", projectReviews]);

function projectReviews($scope, mcapi, $filter, dateGenerate, User, Projects, project) {
    $scope.viewReview = function (review) {
        $scope.model = {
            selected: false,
            comment: ""
        };
        mcapi('/reviews/%', review.id)
            .success(function (data) {
                $scope.highlight_review = review;
                $scope.review = data;
            }).jsonp();
    };

    $scope.editReview = function(index){
        $scope.edit_index = index;
    };

    $scope.saveReview = function(index) {
        if ($scope.review.messages[index].message === "") {
            return;
        }
        $scope.edit_index = -1;
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
            }).put({'messages': $scope.review.messages});
    };

    $scope.addComment = function() {
        if ($scope.model.comment.length === 0) {
            return;
        }
        $scope.review.messages.push({
            'message': $scope.model.comment,
            'who': User.u(),
            'date': dateGenerate.new_date()
        });
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
            }).put({'messages': $scope.review.messages});
    };

    $scope.closeReview = function() {
        mcapi('/reviews/%', $scope.review.id)
            .success(function () {
                $scope.loadProjectReviews(project.id, true);
                $scope.review = '';
            }).put({'status': 'close'});
    };

    $scope.reOpenReview = function() {
        mcapi('/reviews/%', $scope.review.id)
            .success(function () {
                $scope.loadProjectReviews(project.id, true);
                $scope.review = '';
            }).put({'status': 'open'});
    };

    $scope.loadProjectReviews = function (id, reload) {
        Projects.getList(reload).then(function (projects) {
            Projects.get(id).then(function (p) {
                project = p;
                $scope.project = p;
                $scope.reviewCount();

            });
        });
    };

    $scope.showReviewsperStatus = function (status) {
        $scope.status = status;
    };

    $scope.reviewCount = function(){
        $scope.open_reviews = $filter('byKey')(project.reviews, 'status', 'open');
        $scope.closed_reviews = $filter('byKey')(project.reviews, 'status', 'close');
    };

    function init() {
        $scope.review = '';
        $scope.status = 'open';
        $scope.project = project;
        $scope.reviewCount();

        $scope.model = {
            new_review: "",
            assigned_to: "",
            title: ""
        };
    }

    init();
}
