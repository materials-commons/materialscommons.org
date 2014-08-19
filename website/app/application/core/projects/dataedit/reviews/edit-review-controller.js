Application.Controllers.controller('projectsDataEditEditReview',
    ["$scope", "mcapi", "User", "$stateParams", "alertService", "pubsub",
        function ($scope, mcapi, User, $stateParams, alertService, pubsub) {

            $scope.editReview = function(index){
                $scope.edit_index = index;
            }

            $scope.saveReview = function(n){


                $scope.edit_index = -1;
            }
            function init() {
                $scope.n = {
                    selected: false
                }
                mcapi('/reviews/%', $stateParams.review_id)
                    .success(function (data) {
                        $scope.review = data;
                    }).jsonp();
            }

            init();

        }]);