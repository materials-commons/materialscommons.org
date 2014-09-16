Application.Controllers.controller('projectsOverviewCreateReview',
                                   ["$scope", "mcapi", "User", "$stateParams", "alertService", "pubsub",
                                    "$state","dateGenerate", "$filter", "$injector", projectsOverviewCreateReview]);

function projectsOverviewCreateReview ($scope, mcapi, User, $stateParams, alertService, pubsub, $state, dateGenerate, $filter, $injector) {

    var validator = $injector.get('$validation');

    $scope.addReview = function () {
        if ($scope.model.new_review === "") {
            return;
        }

        if ($scope.model.title === "") {
            return;
        }

        if ($scope.model.assigned_to === "") {
            return;
        }

        $scope.review = {messages: []};
        $scope.review.item_id = $scope.project.id;
        $scope.review.item_type = 'datafile';
        $scope.review.item_name = $scope.project.name;
        $scope.review.author = User.u();
        $scope.review.assigned_to = $scope.model.assigned_to;
        $scope.review.status = 'open';
        $scope.review.title = $scope.model.title;
        $scope.review.messages.push({'message': $scope.model.new_review, 'who': User.u(), 'date': dateGenerate.new_date()});
        $scope.saveData();
    };

    $scope.saveData = function () {
        mcapi('/reviews')
            .success(function (data) {
                $state.go('projects.project.editreviews', {'review_id': data.id});
                $scope.model.new_review = "";
                pubsub.send('open_reviews.change');
            }).post($scope.review);
    };

    $scope.viewReview = function(review){
        $state.go('projects.project.editreviews', {'review_id': review.id});
    };

    $scope.showReviews = function(status){
        $scope.status = status;
        if(status == 'open'){
            $scope.list_reviews = $scope.open_reviews;
        }
        else if(status == 'close'){
            $scope.list_reviews = $scope.closed_reviews;
        }
    };

    $scope.loadReviews = function(id){
        mcapi('/project/%/reviews', id)
            .success(function (reviews) {
                $scope.open_reviews = $filter('reviewFilter')(reviews, 'open');
                $scope.closed_reviews = $filter('reviewFilter')(reviews, 'close');
                $scope.list_reviews =  $scope.open_reviews;
                $scope.status = 'open';
            }).jsonp();

    };

    function init() {
        $scope.list_reviews = [];
        $scope.project_id = $stateParams.id
        mcapi('/projects/%', $stateParams.id)
            .success(function (data) {
                $scope.project = data;
            }).jsonp();
        $scope.loadReviews($stateParams.id);
        $scope.model = {
            new_review: "",
            assigned_to: "",
            title: ""
        };
        mcapi('/selected_users')
            .success(function (data) {
                $scope.users = data;
            }).jsonp();
    }

    init();

}
