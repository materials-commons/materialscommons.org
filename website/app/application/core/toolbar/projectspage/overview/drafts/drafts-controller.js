Application.Controllers.controller('toolbarProjectsPageOverviewDrafts',
    ["$scope", "pubsub", "ProvDrafts", "$state", "alertService", "Nav", "$stateParams",
        function ($scope, pubsub, ProvDrafts, $state, alertService, Nav, $stateParams) {
            pubsub.waitOn($scope, ProvDrafts.channel, function () {
                $scope.drafts = ProvDrafts.drafts;

            });

            $scope.gotoDraft = function (draft) {
                $state.go('toolbar.projectspage', {id: draft.project_id, draft_id: draft.id});
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

            $scope.cloneProvenance = function (draft) {
                var copy_draft = angular.copy(draft), new_draft = {};
                if (copy_draft.clone_number) {
                    new_draft = ProvDrafts.prepareClone(copy_draft, draft.clone_number);
                } else {
                    new_draft = ProvDrafts.prepareClone(copy_draft, '');
                }
                if (new_draft) {
                    ProvDrafts.current = new_draft;
                    ProvDrafts.saveDraft();
                } else {
                    alertService.sendMessage("Draft already exists !");
                }

            };

            function init() {
                $scope.project_id = $stateParams.id;
                $scope.drafts = ProvDrafts.drafts;
            }

            init();
        }]);