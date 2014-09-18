Application.Controllers.controller('projectsProject',
                                   ["$scope", "$stateParams", "pubsub", "$state",
                                    "ProvDrafts", "$filter", "$rootScope", "model.projects", "actionStatus",
                                    projectsProject]);

function projectsProject ($scope, $stateParams, pubsub, $state,
                           ProvDrafts, $filter, $rootScope, projects, actionStatus) {
    pubsub.waitOn($scope, ProvDrafts.channel, function () {
        $scope.drafts = ProvDrafts.drafts;
    });

//    pubsub.waitOn($scope, 'open_reviews.change', function () {
//        $scope.countReviews();
//    });

    $scope.countReviews = function(){
        //$scope.open_reviews = []
        // mcapi('/project/%/reviews', $scope.project_id)
        //     .success(function (reviews) {

        //     }).jsonp();
    };

    pubsub.waitOn($scope, 'notes.add', function getNotes() {
        // $scope.getProject();
    });

    $scope.countDrafts = function () {
        // if ($scope.project_id === "") {
        //     return;
        // }
        // mcapi('/drafts/project/%', $scope.project_id)
        //     .success(function (drafts) {

        //     }).jsonp();
    };

    $scope.getActiveTabStyle = function() {
        return {
            'background-color': $rootScope.currentProjectColor,
            color: 'white',
            'font-weight': 'bold'
        };
    };

    $scope.getInactiveTabStyle = function() {
        return {
            'background-color': $rootScope.currentProjectColorLight,
            color: $rootScope.inactiveColor
        };
    };

    $scope.isActive = function (tab) {
        return tab === $scope.activeTab;
    };

    function init() {
        $scope.open_reviews = [];
        $scope.tag = {
            name: "",
            color: "blue",
            icon: "tag"
        };

        $scope.icons = ["tag", "exclamation", "asterisk", "bookmark", "bullseye", "check", "eye",
                        "fighter-jet", "flag", "fire", "frown-o", "heart", "rocket", "thumbs-up", "thumbs-down"];
        $scope.project_id = $stateParams.id;
        $scope.from = $stateParams.from;

        projects.get($scope.project_id).then(function(project) {
            var actions = [
                "create-provenance",
                "create-sample",
                "create-note",
                "create-note"
            ];
            $scope.project = project;
            actionStatus.addProject(project.id, actions);
        });
    }
    init();
}
