Application.Controllers.controller('projectsDataEditEditReview',
    ["$scope", "mcapi", "User", "$stateParams", "dateGenerate", "pubsub",
        function ($scope, mcapi, User, $stateParams, dateGenerate, pubsub) {

            $scope.editReview = function(index){
                $scope.edit_index = index;
            }

            $scope.saveReview = function(n){
                $scope.edit_index = -1;
            }

            $scope.addComment = function(){
                $scope.review.messages.push({'message': $scope.model.comment, 'who': User.u(), 'date': dateGenerate.new_date()});
                mcapi('/reviews/%', $scope.review.id)
                    .success(function (data) {
                    }).put({'messages': $scope.review.messages});
            }

            $scope.closeReview = function(){
                mcapi('/reviews/%', $scope.review.id)
                    .success(function (data) {
                    }).put({'status': 'close'});
            }
            $scope.reOpenReview = function(){
                mcapi('/reviews/%', $scope.review.id)
                    .success(function (data) {
                    }).put({'status': 'open'});
            }
            function init() {
                $scope.model = {
                    selected: false,
                    comment: ""

                }
                mcapi('/reviews/%', $stateParams.review_id)
                    .success(function (data) {
                        $scope.review = data;
                    }).jsonp();
            }

            init();

        }]);