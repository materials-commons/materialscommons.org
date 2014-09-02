Application.Directives.directive('actionTag', actionTagDirective);

function actionTagDirective() {
    return {
        controller: "actionStackTagController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-tag.html"
    };
}

Application.Controllers.controller("actionStackTagController",
                                   ["$scope", "mcapi", "User", "pubsub", actionStackTagController]);

function actionStackTagController($scope, mcapi, User, pubsub) {

    function resetTag() {
        $scope.tag = {
            name: "",
            color: "blue",
            icon: "tag"
        };
    }

    $scope.createTag = function(){
        mcapi('/user/%/tags', User.u())
            .success(function () {
                pubsub.send('tag.new');
                $scope.toggleStackAction('tag', 'project-action-stack');
            }).put($scope.tag);
        resetTag();
    };

    $scope.cancel = function() {
        resetTag();
        $scope.toggleStackAction('tag', 'project-action-stack');
    };

    $scope.iconSelected = function(icon) {
        $scope.tag.icon = icon;
    };

    function init() {
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

    init();
}
