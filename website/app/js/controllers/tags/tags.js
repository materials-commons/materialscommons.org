function AllTagsController($scope, $location, mcapi, $state, $stateParams) {
        $scope.tagHeader = "All Tags";
        mcapi('/tags/count')
            .success(function (data) {
                $scope.tags = data;
            }).jsonp();


}

function MyTagsController($scope, mcapi){
    $scope.tagHeader = "My Tags";
    mcapi('tags/count')
        .success(function (data) {
            $scope.tags = data;
        }).jsonp();
}

function TagDataController($scope, $stateParams, $state, mcapi) {
    $scope.tag = $stateParams.name;
    mcapi('/datafiles/tag/%', $scope.tag)
        .success(function (data) {
            $scope.docs = data;


        }).jsonp();

}

function GlobalTagCloudController($scope, mcapi, User) {
    $scope.cloudtype = "Global";
    mcapi('/tags/count')
        .success(function (data) {
            $scope.word_list = [];
            angular.forEach(data, function (tag) {
                $scope.word_list.push({text: tag.name, weight: tag.count, link: "#/mytools/data/bytag/" + tag.name});
            });
        }).jsonp();
}
