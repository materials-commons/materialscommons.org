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

//    $scope.listDataForTag = function(tag) {
  //      $location.path("/tags/data/bytag/" + tag + "/");

    $scope.listDataForTag = function(key) {
        var tag = $scope.listtype == "mytags" ? key[1] : key[0];
        $location.path("/tags/data/bytag/" + tag +"/" + User.get_username());
    }

    if ($routeParams.tag_name){
       // alert($routeParams.tag_name);
        $scope.tag_name = $routeParams.tag_name;
        $scope.all_tags_by_tag_name = $scope.mcdb.query("materialscommons-app", "docs_by_tag", {key:$routeParams.tag_name});


    }


}


function TagDataController($scope, $routeParams, $location, Mcdb) {
    $scope.tag = $routeParams.tag;
    $scope.mcdb = Mcdb.db();
    $scope.mcdb.query("materialscommons-app", "docs_by_user_and_tag", {startkey:[$scope.user], endkey:[$routeParams.user, $scope.tag]});

    $scope.editData = function(id) {
        $location.path("/data/edit/" + id);
    }

    $scope.get_alldata_for_tag = function(tag){
        $location.path("/tags/tag_info/" + tag);
    }

}
