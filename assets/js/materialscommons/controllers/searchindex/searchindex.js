
function SearchIndexController($scope, $routeParams, $location, Search){

        if ($routeParams.subpage == "search_key"){
            $scope.keyword = $routeParams.name;

        }

       // $scope.search_index = function(){
        $scope.noOfPages = 1;
        $scope.currentPage = 1;
        $scope.size = 5;
        $scope.newPage = 1;

        $scope.all_results = Search.get_all_phones($scope.keyword, function(all_results){
            $scope.total_hits = $scope.all_results.hits.total ;
            $scope.noOfPages = Math.round($scope.total_hits/$scope.size) ;
            $scope.$watch('currentPage', function(newPage){
                $scope.watchPage = newPage;

                //or any other code here
                $scope.from = $scope.size * (newPage - 1)
                $scope.results = Search.get_set_of_results_for_pagination($scope.keyword, $scope.from, $scope.size, function(results){
                });
            });
            scope.pageChanged = function(page) {
                scope.callbackPage = page;
                $scope.watchPage = newPage;
            };
        });

   // }



}


