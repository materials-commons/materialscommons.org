function TagListController($scope, $routeParams, $location, mcjsonp, User) {
    $scope.listtype = $routeParams.listtype;
    if ($routeParams.listtype == "all") {
        $scope.tagHeader = "All Tags";
        mcjsonp('/tags/count')
            .success(function (data) {
                $scope.tags = data;
            });
    }
    else if ($routeParams.listtype == "mytags") {
        $scope.tagHeader = "My Tags";
        mcjsonp('/user/%/tags/count', User.u())
            .success(function (data) {
                $scope.tags = data;
            });
    }

    $scope.listDataForTag = function (tag) {
        $location.path("/tags/data/bytag/" + tag + "/" + User.u());
    }
}

function TagDataController($scope, $routeParams, $location, mcjsonp, User) {
    $scope.tag = $routeParams.tag;
    mcjsonp('/user/%/datafiles/tag/%', User.u(), $routeParams.tag)
        .success(function (data) {
            $scope.docs = data;
        });

    $scope.editData = function (id) {
        $location.path("/data/edit/" + id);
    }

    $scope.get_alldata_for_tag = function (tag) {
        $location.path("/tags/tag_info/" + tag);
    }
}

function GlobalTagCloudController($scope, mcjsonp, User) {
    $scope.cloudtype = "Global";
    mcjsonp('/tags/count')
        .success(function (data) {
            $scope.word_list = [];
            angular.forEach(data, function (tag) {
                $scope.word_list.push({text: tag.name, weight: tag.count, link: "#/tags/data/bytag/" + tag.name + '/' + User.u()});
            });
        });
}
