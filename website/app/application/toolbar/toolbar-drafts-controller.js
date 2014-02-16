Application.Controllers.controller('toolbarDrafts',
    ["$scope", "Stater", "pubsub", "User", function ($scope, Stater, pubsub, User) {
        pubsub.waitOn($scope, 'drafts.change', function () {
            $scope.drafts = Stater.all;
        });

        pubsub.waitOn($scope, 'drafts.update', function () {
            Stater.retrieveAll(User.u(), function () {
                pubsub.send('drafts.change', '');
            })
        });

        $scope.init = function () {
            $scope.drafts = Stater.all;
            Stater.retrieveAll(User.u(), function () {
                $scope.drafts = Stater.all;
            });
        };

        $scope.init();
    }]);