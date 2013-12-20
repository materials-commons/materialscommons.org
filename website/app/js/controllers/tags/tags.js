function AllTagsController($scope, $location, mcapi, User) {
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

function TagDataController($scope, $stateParams, mcapi) {
    $scope.tag = $stateParams.name;
    mcapi('/datafiles/tag/%', $stateParams.name)
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
                $scope.word_list.push({text: tag.name, weight: tag.count, link: "#/data/bytag/" + tag.name});
            });
        }).jsonp();
}
