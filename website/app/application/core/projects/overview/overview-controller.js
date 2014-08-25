Application.Controllers.controller('projectsOverview',
    ["$scope", "$stateParams", "pubsub", "$state", "ProvDrafts", "mcapi", "Tags","User", "$filter",
        function ($scope, $stateParams, pubsub, $state, ProvDrafts, mcapi, Tags, User, $filter) {
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
            }

            pubsub.waitOn($scope, 'access.change', function () {
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

            $scope.createTag = function(){
                mcapi('/user/%/tags', User.u())
                    .success(function () {
                        $scope.loadUserTags();
                    }).put($scope.bk);
                $scope.bk = {}
            }

            $scope.showTab = function (tab) {
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
            $scope.getProject = function(){
                mcapi('/projects/%', $scope.project_id)
                    .success(function (project) {
                        $scope.project = project;
                    }).jsonp();
            }

            $scope.loadUserTags= function () {
                mcapi('/user/%/tags', User.u())
                    .success(function (user) {
                        $scope.u_tags = user.preferences.tags;
                        Tags.updateUserTags($scope.u_tags)
                    }).jsonp();
            }
            function init() {
                $scope.bk = {
                    name: ''
                }
                $scope.project_id = $stateParams.id;
                $scope.from = $stateParams.from;
                $scope.processes = [];
                $scope.drafts = ProvDrafts.loadRemoteDrafts($scope.project_id);
                $scope.getProject();
                $scope.loadUserTags();
                $scope.countReviews()
            }
            init();
        }]);
