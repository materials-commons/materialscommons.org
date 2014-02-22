Application.Controllers.controller('toolbarDrafts',
    ["$scope", "pubsub", "ProvDrafts",
        function ($scope, pubsub, ProvDrafts) {
            pubsub.waitOn($scope, ProvDrafts.channel, function () {
                $scope.drafts = ProvDrafts.drafts;
            });

            $scope.drafts = ProvDrafts.drafts;

            $scope.delete = function (draftId) {
                ProvDrafts.deleteRemoteDraft(draftId);
            };
        }]);