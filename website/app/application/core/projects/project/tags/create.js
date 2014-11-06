Application.Controllers.controller("projectTagsCreate",
                                   ["$scope", "mcapi", "User", "$stateParams", "recent",
                                    projectTagsCreate]);

function projectTagsCreate($scope, mcapi, User, $stateParams, recent) {
    var stateID = $stateParams.sid;
    var projectID = $stateParams.id;

    function resetTag() {
        $scope.tag = {
            name: "",
            color: "blue",
            icon: "tag",
            description: ""
        };
    }

    $scope.createTag = function(){
        mcapi('/user/%/tags', User.u())
            .success(function () {
                User.attr().preferences.tags.push(angular.copy($scope.tag));
                recent.delete(projectID, stateID);
                recent.gotoLast(projectID);
            }).put($scope.tag);
    };

    $scope.cancel = function() {
        recent.delete(projectID, stateID);
        recent.gotoLast(projectID);
    };

    $scope.iconSelected = function(icon) {
        $scope.tag.icon = icon;
    };

    $scope.icons = [
        "tag",
        "exclamation",
        "asterisk",
        "bookmark",
        "bullseye",
        "check",
        "eye",
        "fighter-jet",
        "flag",
        "fire",
        "frown-o",
        "heart",
        "rocket",
        "thumbs-up",
        "thumbs-down"
    ];

    resetTag();

}
