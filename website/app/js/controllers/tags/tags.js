function AllTagsController($scope, mcapi, pubsub) {
    $scope.tagHeader = "All Tags";

    pubsub.waitOn($scope, 'tags.change', function() {
        $scope.tagsCount();
    });

    $scope.tagsCount = function() {
        mcapi('/tags/count')
            .success(function (data) {
                $scope.tags = data;
            }).jsonp();
    }

    $scope.tagsCount();
}

function MyTagsController($scope, mcapi) {
    $scope.tagHeader = "My Tags";
    mcapi('tags/count')
        .success(function (data) {
            $scope.tags = data;
        }).jsonp();
}

function TagDataController($scope, $stateParams, mcapi) {
    $scope.tag = $stateParams.name;
    mcapi('/datafiles/tag/%', $scope.tag)
        .success(function (data) {
            $scope.docs = data;


        }).jsonp();

}

function GlobalTagCloudController($scope, mcapi) {
    $scope.cloudtype = "Global";
    mcapi('/tags/count')
        .success(function (data) {
            $scope.word_list = [];
            angular.forEach(data, function (tag) {
                $scope.word_list.push({text: tag.name, weight: tag.count, link: "#/mytools/data/bytag/" + tag.name});
            });
        }).jsonp();
}
