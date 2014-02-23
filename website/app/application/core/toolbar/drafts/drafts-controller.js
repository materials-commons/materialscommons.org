Application.Controllers.controller('toolbarDrafts',
    ["$scope", "pubsub", "ProvDrafts", "$state",
        function ($scope, pubsub, ProvDrafts, $state) {
            pubsub.waitOn($scope, ProvDrafts.channel, function () {
                $scope.drafts = ProvDrafts.drafts;
            });

            $scope.gotoDraft = function (draft) {
                $state.go('toolbar.projectspage', {id: draft.attributes.project_id, draft_id: draft.id});
            };

            $scope.markForReview = function (draft) {
                $scope.draft = draft;
            };

            $scope.deleteDraft = function (draft) {
                ProvDrafts.deleteRemoteDraft(draft.id);
            };

            $scope.closeReviews = function () {
                $state.go('toolbar.drafts');
            };

            $scope.init = function () {
                $scope.drafts = ProvDrafts.drafts;
            };

            $scope.init();
        }]);