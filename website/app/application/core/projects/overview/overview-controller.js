Application.Controllers.controller('projectsOverview',
                                   ["$scope", "$stateParams", "pubsub", "$state",
                                    "ProvDrafts", "$filter", "$rootScope", "model.projects",
                                    projectsOverview]);

function projectsOverview ($scope, $stateParams, pubsub, $state,
                           ProvDrafts, $filter, $rootScope, projects) {
    pubsub.waitOn($scope, ProvDrafts.channel, function () {
        $scope.drafts = ProvDrafts.drafts;
    });

    pubsub.waitOn($scope, 'open_reviews.change', function () {
        $scope.countReviews();
    });

    $scope.countReviews = function(){
        //$scope.open_reviews = []
        // mcapi('/project/%/reviews', $scope.project_id)
        //     .success(function (reviews) {

        //     }).jsonp();
    };

    pubsub.waitOn($scope, 'access.change', function () {
        $scope.getProject();
    });

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



    $scope.showTab = function (tab) {
        $scope.activeTab = tab;
        switch (tab) {
        case "files":
            $state.go('projects.overview.files');
            break;
        case "provenance":
            $state.go('projects.overview.provenance');
            break;
        case "drafts":
            $state.go('projects.overview.drafts');
            break;
        case "samples":
            $state.go('projects.overview.samples');
            break;
        case "notes":
            $state.go('projects.overview.notes');
            break;
        case "settings":
            $state.go('projects.overview.settings');
            break;
        case "reviews":
            $state.go('projects.overview.reviews');
            break;
        }
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

        console.log("overview-controller:" + $scope.project_id);

        projects.get($scope.project_id).then(function(project) {
            console.dir(project);
            $scope.project = project;
            $scope.open_reviews = $filter('byKey')(reviews, 'status', 'open');
        }, function() {
            console.log("projects.get() failed");
        });
    }
    init();
}
