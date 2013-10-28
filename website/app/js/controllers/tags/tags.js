function AllTagsController($scope, $location, mcapi, User) {
        $scope.tagHeader = "All Tags";
        mcapi('/tags/count')
            .success(function (data) {
                $scope.tags = data;
            }).jsonp();

        $scope.listDataForTag = function (tag) {
            $location.path("/tags/data/bytag/" + tag + "/" + User.u());
    }
}

function MyTagsController($scope, mcapi){
    $scope.tagHeader = "My Tags";
    mcapi('tags/count')
        .success(function (data) {
            $scope.tags = data;
        }).jsonp();
}

function TagDataController($scope, $routeParams, $location, mcapi) {
    $scope.tag = $routeParams.tag;
    mcapi('/datafiles/tag/%', $routeParams.tag)
        .success(function (data) {
            $scope.docs = data;
        }).jsonp();

    $scope.editData = function (id) {
        $location.path("/data/edit/" + id);
    }

    $scope.get_alldata_for_tag = function (tag) {
        $location.path("/tags/tag_info/" + tag);
    }
}

function GlobalTagCloudController($scope, mcapi, User) {
    $scope.cloudtype = "Global";
    mcapi('/tags/count')
        .success(function (data) {
            $scope.word_list = [];
            angular.forEach(data, function (tag) {
                $scope.word_list.push({text: tag.name, weight: tag.count, link: "#/tags/data/bytag/" + tag.name + '/' + User.u()});
            });
        }).jsonp();
}
