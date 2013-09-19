function SearchIndexController($scope, $routeParams, $location, Search, $filter, mcapi) {

    if ($routeParams.subpage == "search_key") {
        $scope.keyword = $routeParams.name;

    }
    $scope.noOfPages = 1;
    $scope.currentPage = 1;
    $scope.size = 10;
    $scope.newPage = 1;


    /*
     $scope.all_results = Search.get_all_info($scope.keyword, function(all_results){
     $scope.total_hits = $scope.all_results.hits.total
     // $scope.total_hits = $filter('elastic_search_filter_data')($scope.all_results.hits.hits).length;
     $scope.noOfPages = Math.round($scope.total_hits/$scope.size) ;
     $scope.$watch('currentPage', function(newPage){
     $scope.watchPage = newPage;

     //or any other code here
     $scope.from = $scope.size * (newPage - 1)
     $scope.results = Search.get_set_of_results_for_pagination($scope.keyword, $scope.from, $scope.size, function(results){
     });
     });
     $scope.pageChanged = function(page) {
     $scope.callbackPage = page;
     $scope.watchPage = newPage;
     };
     });
     */
    mcapi('/search_index/keyword/%', $scope.keyword)
        .success(function (data) {
            $scope.total_hits = data.count;
            $scope.noOfPages = Math.round($scope.total_hits / $scope.size);
            console.log('here is the es data ' + data.count + ' results are ' + data.results);
            $scope.results = data.results;
            $scope.count = data.count;
            //console.dir('results are as' + data.results[0]);
            // $scope.$watch('currentPage', function (newPage) {
            // $scope.watchPage = newPage;
            //$scope.from = $scope.size * (newPage - 1)
            //$scope.results = Search.get_set_of_results_for_pagination($scope.keyword, $scope.from, $scope.size, function(results){

            //});
        })
        .error(function () {

        }).jsonp();
}


