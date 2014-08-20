Application.Controllers.controller('projectsDataEditCreateReview',
    ["$scope", "mcapi", "User", "$stateParams", "alertService", "pubsub", "$state","dateGenerate", "$filter",
        function ($scope, mcapi, User, $stateParams, alertService, pubsub, $state, dateGenerate, $filter) {
            $scope.addReview = function () {
                $scope.review = {messages: []}
                $scope.review.item_id = $scope.doc.id;
                $scope.review.item_type = 'datafile';
                $scope.review.item_name = $scope.doc.name;
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
                        console.log(data)
                        $state.go('projects.dataedit.editreviews', {'review_id': data.id})
                        $scope.model.new_review = "";
                    }).post($scope.review);
            };
            $scope.viewReview = function(review){
                $state.go('projects.dataedit.editreviews', {'review_id': review.id})
            }
            $scope.showReviews = function(status){
                if(status == 'open'){
                    $scope.list_reviews = $scope.open_reviews;
                }
                else if(status == 'close'){
                    $scope.list_reviews = $scope.closed_reviews;
                }
            }
            function init() {
                $scope.list_reviews = [];

                mcapi('/datafile/%', $stateParams.data_id)
                    .success(function (data) {
                        $scope.datafile = data;
                    }).jsonp();

                mcapi('/datafiles/%/reviews', $stateParams.data_id)
                    .success(function (reviews) {
                        $scope.list_reviews = reviews;
                        $scope.open_reviews = $filter('reviewFilter')($scope.list_reviews, 'open');
                        $scope.closed_reviews = $filter('reviewFilter')($scope.list_reviews, 'close');
                    }).jsonp();

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

        }]);