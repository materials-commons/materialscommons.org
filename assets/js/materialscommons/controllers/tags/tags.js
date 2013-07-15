function TagListController($scope, $routeParams, $location, cornercouch, User)
{
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.listtype = $routeParams.listtype;
    $scope.mcdb = $scope.server.getDB("materialscommons");
    if ($routeParams.listtype == "all")
    {
        $scope.tagHeader = "All Tags";
        $scope.mcdb.query("materialscommons-app", "tags_by_count", {group_level:1});
    }
    else if ($routeParams.listtype == "mytags")
    {
        $scope.tagHeader = "My Tags";
        var username = User.get_username();
        $scope.mcdb.query("materialscommons-app", "tags_by_user", {group_level:2, startkey:[username], endkey:[username, {}]});

    }

    $scope.listDataForTag = function(tag) {
        $location.path("/tags/data/bytag/" + tag + "/");
    }

}


function TagDataController($scope, $routeParams, $location, Mcdb) {
    $scope.tag = $routeParams.tag;
    $scope.mcdb = Mcdb.db();

    Mcdb.query("docs_by_tag_and_user", {startkey:[$scope.tag], endkey:[$scope.tag, $routeParams.user ? $routeParams.user : {}]});

    $scope.editData = function(id) {
        $location.path("/data/edit/" + id);
    }
}
