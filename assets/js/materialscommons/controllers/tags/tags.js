function TagListController($scope, $routeParams, $location, cornercouch, User)
{
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    if ($routeParams.listtype == "all")
    {
        $scope.tagHeader = "All Tags";
        getAllTags($scope.mcdb);
    }
    else
    {
        // $routeParams.listtype == "mytags"
        $scope.tagHeader = "My Tags";
        getMyTags($scope.mcdb, User.get_username());

    }

    $scope.listDataForTag = function(tag) {
        $location.path("/tags/data/bytag/" + tag +"/");
    }
}


function getAllTags(db)
{
    db.query("materialscommons-app", "tags_by_count", {group_level:1});
}

function getMyTags(db, user)
{

}

function TagDataController($scope, $routeParams, $location, Mcdb) {
    $scope.tag = $routeParams.tag;
    $scope.mcdb = Mcdb.db();

    Mcdb.query("docs_by_tag_and_user", {startkey:[$scope.tag], endkey:[$scope.tag, $routeParams.user ? $routeParams.user : {}]});

    $scope.editData = function(id) {
        $location.path("/data/edit/" + id);
    }
}
