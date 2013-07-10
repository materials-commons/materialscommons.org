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
    $scope.tag = "c";
    $scope.mcdb = Mcdb.db();
    Mcdb.query("docs_by_tag_and_user", {startkey:["c"], endkey:["c", {}]});
}

//function TestQueryController($scope, cornercouch)
//{
//    $scope.server = cornercouch();
//    $scope.server.session();
//    $scope.mcdb = $scope.server.getDB("materialscommons");
//
//    $scope.mcdb.query("materialscommons-app", "datagroups_with_data", {startkey:["01bbcbcbbe0a473899014e9f2f2fe04d"], endkey:["01bbcbcbbe0a473899014e9f2f2fe04d",0]});
//}
