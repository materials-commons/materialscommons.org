Application.Controllers.controller('_toolbarDrafts',
    ["$scope", "ProvDrafts", "pubsub",
        function ($scope, ProvDrafts, pubsub) {
            pubsub.waitOn($scope, ProvDrafts.channel, function () {
                $scope.drafts = ProvDrafts.drafts;
            });

            $scope.init = function () {
                $scope.drafts = ProvDrafts.drafts;
                ProvDrafts.loadRemoteDrafts();
            };

            $scope.init();
        }]);