Application.Controllers.controller('projectsOverview',
                                   ["$scope", "$stateParams", "pubsub", "$state",
                                    "ProvDrafts", "mcapi", "Tags","User", "$filter", "$rootScope",
                                    projectsOverview]);

function projectsOverview ($scope, $stateParams, pubsub, $state, ProvDrafts, mcapi, Tags, User, $filter, $rootScope) {
    pubsub.waitOn($scope, ProvDrafts.channel, function () {
        $scope.drafts = ProvDrafts.drafts;
    });

    pubsub.waitOn($scope, 'open_reviews.change', function () {
        $scope.countReviews();
    });

    $scope.countReviews = function(){
        mcapi('/project/%/reviews', $scope.project_id)
            .success(function (reviews) {
                $scope.open_reviews = $filter('reviewFilter')(reviews, 'open');
            }).jsonp();
    };

    pubsub.waitOn($scope, 'access.change', function () {
        $scope.getProject();
    });

    pubsub.waitOn($scope, 'notes.add', function getNotes() {
        $scope.getProject();
    });

    $scope.countDrafts = function () {
        if ($scope.project_id === "") {
            return;
        }
        mcapi('/drafts/project/%', $scope.project_id)
            .success(function (drafts) {
                $scope.drafts_count = drafts.length;
            }).jsonp();
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

    $scope.createTag = function(){
        mcapi('/user/%/tags', User.u())
            .success(function () {
                $scope.loadUserTags();
            }).put($scope.tag);
        $scope.tag = {
            name: "",
            color: "blue",
            icon: "tag"
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

    $scope.getProject = function(){
        mcapi('/projects/%', $scope.project_id)
            .success(function (project) {
                $scope.project = project;
            }).jsonp();
    };

    $scope.loadUserTags= function () {
        mcapi('/user/%/tags', User.u())
            .success(function (user) {
                $scope.u_tags = user.preferences.tags;
                Tags.updateUserTags($scope.u_tags);
            }).jsonp();
    };

    $scope.iconSelected = function(icon) {
        $scope.tag.icon = icon;
    };


    function init() {
        $scope.tag = {
            name: "",
            color: "blue",
            icon: "tag"
        };

        $scope.icons = ["tag", "exclamation", "asterisk", "bookmark", "bullseye", "check", "eye",
                        "fighter-jet", "flag", "fire", "frown", "heart", "rocket", "thumbs-up", "thumbs-down"];
        $scope.activeTab = "files";
        $scope.project_id = $stateParams.id;
        $scope.from = $stateParams.from;
        $scope.drafts = ProvDrafts.loadRemoteDrafts($scope.project_id);
        $scope.getProject();
        $scope.loadUserTags();
        $scope.countReviews();
    }
    init();
}
