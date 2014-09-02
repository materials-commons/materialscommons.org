Application.Directives.directive('actionDrafts', actionDraftsDirective);

function actionDraftsDirective() {
    return {
        controller: "actionDraftsController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-drafts.html"
    };
}

Application.Controllers.controller('actionDraftsController',
    ["$scope", "$state", "ProvDrafts","pubsub","$stateParams", actionDraftsController]);

function actionDraftsController($scope,$state, ProvDrafts, pubsub,$stateParams) {
    pubsub.waitOn($scope, ProvDrafts.channel, function () {
        $scope.drafts = ProvDrafts.drafts;

    });

    $scope.gotoDraft = function (draft) {
        $state.go('projects.provenance', {id: draft.project_id, draft_id: draft.id});
    };

    $scope.markForReview = function (draft) {
        $scope.draft = draft;
        var modalInstance = $modal.open({
            templateUrl: 'application/core/projects/overview/drafts/review.html',
            controller: '_projectsDraftsReviewModal',
            resolve: {
                draft: function () {
                    return $scope.draft;
                }
            }
        });
        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            //$log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.deleteDraft = function (draft) {
        ProvDrafts.deleteRemoteDraft(draft.id);
    };

    $scope.closeReviews = function () {
        $state.go('projects.drafts');
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
//            alertService.sendMessage("Draft already exists !");
        }
    };

    function init() {
        $scope.project_id = $stateParams.id;
        $scope.drafts = ProvDrafts.loadRemoteDrafts($scope.project_id);
        console.log($scope.project_id)
    }

    init();
}
