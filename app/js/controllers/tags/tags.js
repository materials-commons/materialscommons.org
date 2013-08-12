function TagListController($scope, $routeParams, $location, $http, User) {
    $scope.listtype = $routeParams.listtype;
    if ($routeParams.listtype == "all") {
        $scope.tagHeader = "All Tags";
        $http.jsonp(mcurljsonp('/tags/count'))
            .success(function (data) {
                $scope.tags = data;
            });
    }
    else if ($routeParams.listtype == "mytags") {
        $scope.tagHeader = "My Tags";
        $http.jsonp(mcurljsonp('/user/%/tags/count', User.u()))
            .success(function (data) {
                $scope.tags = data;
            });
    }

    $scope.listDataForTag = function (tag) {
        $location.path("/tags/data/bytag/" + tag + "/" + User.u());
    }
}

function TagDataController($scope, $routeParams, $location, $http, User) {
    $scope.tag = $routeParams.tag;
    $http.jsonp(mcurljsonp('/user/%/data/tag/%', User.u(), $routeParams.tag))
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

function GlobalTagCloudController($scope, $http, User) {
    $scope.cloudtype = "Global";
    $http.jsonp(mcurljsonp('/tags/count'))
        .success(function (data) {
            $scope.word_list = [];
            angular.forEach(data, function (tag) {
                $scope.word_list.push({text: tag.name, weight: tag.count, link: "#/tags/data/bytag/" + tag.name + '/' + User.u()});
            });
        });
}
