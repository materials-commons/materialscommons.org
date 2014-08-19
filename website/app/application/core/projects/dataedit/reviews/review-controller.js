Application.Controllers.controller('projectsDataEditCreateReview',
    ["$scope", "mcapi", "User", "$stateParams", "alertService", "pubsub", "$state","dateGenerate",
        function ($scope, mcapi, User, $stateParams, alertService, pubsub, $state, dateGenerate) {
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
                $scope.model.new_review = "";
            };
            $scope.saveData = function () {
                mcapi('/reviews')
                    .success(function (data) {
                    }).post($scope.review);
            };
            $scope.viewReview = function(review){
                $state.go('projects.dataedit.editreviews', {'review_id': review.id})
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