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
        $http.jsonp(mcurljsonpu('/tags/count', User))
            .success(function (data) {
                $scope.tags = data;
            });
    }

    $scope.listDataForTag = function (tag) {
        $location.path("/tags/data/bytag/" + tag + "/" + User.get_username());
    }

//    if ($routeParams.tag_name){
//       // alert($routeParams.tag_name);
//        $scope.tag_name = $routeParams.tag_name;
//        $scope.all_tags_by_tag_name = $scope.mcdb.query("materialscommons-app", "docs_by_tag", {key:$routeParams.tag_name});
//    }
}

function TagDataController($scope, $routeParams, $location, $http, User) {
    $scope.tag = $routeParams.tag;
    $http.jsonp(mcurljsonpu2('/data/tag', $routeParams.tag, User))
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
