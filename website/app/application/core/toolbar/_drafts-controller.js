Application.Controllers.controller('_toolbarDrafts',
    ["$scope", "ProvDrafts", "pubsub",
        function ($scope, ProvDrafts, pubsub) {
            pubsub.waitOn($scope, ProvDrafts.channel, function () {
                $scope.drafts = ProvDrafts.drafts;
            });

            function init() {
                $scope.drafts = ProvDrafts.drafts;
                ProvDrafts.loadRemoteDrafts();
            }

            init();
        }]);